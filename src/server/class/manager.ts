import * as PATH from "path";
import * as FS from "fs";
import { Parser } from "./parser";
import * as JSZip from "jszip";
import { ITorrentItem, IExportOption, EFilterType } from "../interface/common";

interface IFilterOption {
  type: EFilterType;
  value: string;
}

export class Manager {
  private resumePath: string = "";
  private torrentsPath: string = "";
  private parser: Parser = new Parser();

  constructor(public rootPath: string = "") {
    this.resumePath = PATH.join(rootPath, "resume");
    this.torrentsPath = PATH.join(rootPath, "torrents");
  }

  /**
   * 获取指定目录下的文件列表
   * @param sourcePath
   * @param needResume
   */
  public list(
    source: string | IFilterOption = "",
    needResume: boolean = false
  ) {
    let options: IFilterOption = {
      type: EFilterType.All,
      value: ""
    };

    let sourcePath: string = "";

    if (typeof source === "string") {
      sourcePath = source;
      options = Object.assign(options, {
        type: EFilterType.Folder,
        value: source
      });
    } else {
      options = Object.assign(options, source);
      if (options.type === EFilterType.Folder) {
        sourcePath = options.value;
      }
    }

    const list = FS.readdirSync(this.torrentsPath);

    const result: any[] = [];

    console.log("已找到 %s 个文件.", list.length);

    list.forEach((name: any, index: number) => {
      let basename = PATH.basename(name, ".torrent");
      let torrentFile = PATH.join(this.torrentsPath, name);
      let resumeFile = PATH.join(this.resumePath, `${basename}.resume`);

      if (FS.existsSync(torrentFile) && FS.existsSync(resumeFile)) {
        console.log("正在解析 -> %s. %s", index + 1, name);

        let resume = this.parser.decode(resumeFile);

        // 如果指定了源目录，当目录不匹配时，跳过当前种子
        if (sourcePath && resume.destination != sourcePath) {
          return;
        }

        let torrent: any = this.parser.parseTorrent(torrentFile);

        if (options.type == EFilterType.Tracker) {
          const announce: any[] = torrent.announce;

          if (!announce) {
            return;
          }

          if (
            !announce.some((tracker: string) => {
              return tracker.indexOf(options.value) !== -1;
            })
          ) {
            return;
          }
        }

        let item: ITorrentItem = {
          name: resume.name,
          basename,
          torrentFile,
          resumeFile,
          size: torrent.length,
          path: resume.destination,
          downloaded: resume.downloaded,
          resume: undefined
        };

        if (needResume) {
          item.resume = resume;
        }

        result.push(item);
      }
    });

    console.log(options);

    return result;
  }

  /**
   * 导出种子文件
   * @param options 指定目录
   * @param to 目标目录
   * @param saveAs 需要另存的 zip 文件
   */
  public export(
    source: string | IExportOption = "",
    to: string = "",
    saveAs: string = ""
  ): Promise<any> {
    return new Promise<any>((resolve?: any, reject?: any) => {
      let options: IExportOption = {
        rootPath: ""
      };

      let from = "";

      if (typeof source === "string") {
        from = source;
        options = Object.assign(options, {
          filterType: EFilterType.Folder,
          filterValue: source,
          targetPath: to,
          outputFile: saveAs
        });
        console.log("开始分析种子文件, 源目录：%s, 目标目录：%s", from, to);
      } else {
        options = Object.assign(options, source);

        console.log("开始分析种子文件, 目标目录：%s", options.targetPath);
        to = options.targetPath;
        saveAs = options.outputFile;
      }

      const list = this.list(
        {
          type: options.filterType,
          value: options.filterValue
        },
        true
      );
      const zip = new JSZip();

      console.log(
        `解析种子完成，共 ${list.length} 个种子符合条件，正在准备创建 zip 文件……`
      );

      list.forEach((item: any) => {
        zip.file(
          `torrents/${item.basename}.torrent`,
          FS.readFileSync(item.torrentFile)
        );

        let resume: any = null;
        if (to) {
          item.resume.destination = to;
          resume = this.parser.encode(item.resume);
          // resume = resume.replace(
          //   `${from.length}:${from}`,
          //   `${to.length}:${to}`
          // );
        } else {
          resume = FS.readFileSync(item.resumeFile);
        }

        zip.file(`resume/${item.basename}.resume`, resume);
      });

      if (saveAs) {
        zip
          .generateNodeStream({
            type: "nodebuffer",
            streamFiles: true,
            compression: "DEFLATE",
            compressionOptions: {
              level: 9
            }
          })
          .pipe(FS.createWriteStream(saveAs))
          .on("finish", () => {
            console.log("--------------------");
            console.log(
              `${list.length} 个种子文件导出完成，已保存为 ${saveAs}`
            );
            resolve(saveAs);
          });
      } else {
        saveAs = "./tmp.zip";
        zip
          .generateNodeStream({
            type: "nodebuffer",
            streamFiles: true,
            compression: "DEFLATE",
            compressionOptions: {
              level: 9
            }
          })
          .pipe(FS.createWriteStream(saveAs))
          .on("finish", () => {
            console.log("--------------------");
            console.log(
              `${list.length} 个种子文件导出完成，已保存为 ${saveAs}`
            );
            FS.readFile(saveAs, (err, data) => {
              FS.unlinkSync(saveAs);
              resolve(data);
            });
          });

        // zip.generateAsync({ type: "blob" }).then((blob: any) => {
        //   resolve(blob);
        // });
      }
    });
  }

  public paths(): Promise<any> {
    return new Promise<any>((resolve?: any, reject?: any) => {
      const list = this.list();
      const result: any = {};

      list.forEach((item: ITorrentItem) => {
        let path = item.path;

        let _item = result[path];
        if (!_item) {
          _item = {
            path,
            size: 0,
            count: 0
          };
        }

        _item.size += item.size;
        _item.count++;

        result[path] = _item;
      });

      resolve(result);
    });
  }

  public getConfig(): Promise<any> {
    return new Promise<any>((resolve?: any, reject?: any) => {
      const path = PATH.join(__dirname, "../../package.json");
      if (FS.existsSync(path)) {
        const config = JSON.parse(FS.readFileSync(path).toString());

        resolve({
          version: config.version,
          description: config.description
        });
      } else {
        reject("ERROR PACKAGE PATH");
      }
    });
  }

  /**
   *
   */
  public import(dataPath: string): Promise<any> {
    return new Promise<any>((resolve?: any, reject?: any) => {
      const data = FS.readFileSync(dataPath);
      JSZip.loadAsync(data)
        .then(zip => {
          let requests: any[] = [];
          // 导入种子文件
          zip.folder("torrents").forEach((relativePath, file) => {
            let path = PATH.join(this.torrentsPath, relativePath);
            requests.push(this.importFile(file, path));
          });

          // 导入resume文件
          zip.folder("resume").forEach((relativePath, file) => {
            let path = PATH.join(this.resumePath, relativePath);
            requests.push(this.importFile(file, path));
          });

          return Promise.all(requests);
        })
        .then(results => {
          let success = 0;
          let skip = 0;
          results.forEach(result => {
            if (result.path.indexOf(".torrent") !== -1) {
              if (result.status === 1) {
                success++;
              } else {
                skip++;
              }
            }
          });
          // 返回导入数量
          resolve({
            success,
            skip
          });
          FS.unlinkSync(dataPath);
        })
        .catch(error => {
          console.log(error);
          reject(error);
          FS.unlinkSync(dataPath);
        });
    });
  }

  private importFile(file: JSZip.JSZipObject, path: string): Promise<any> {
    return new Promise<any>((resolve?: any, reject?: any) => {
      // 如果文件已存在，则跳过
      if (FS.existsSync(path)) {
        console.log("%s 已存在，跳过。", path);
        resolve({
          path,
          status: 2
        });
        return;
      }
      // 写入文件
      file
        .nodeStream()
        .pipe(FS.createWriteStream(path))
        .on("finish", function() {
          console.log("%s 已导入", path);
          resolve({
            path,
            status: 1
          });
        });
    });
  }
}
