import * as PATH from "path";
import * as FS from "fs";
import { Parser } from "./parser";
import * as JSZip from "jszip";
import { ITorrentItem } from "../interface/common";

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
  public list(sourcePath: string = "", needResume: boolean = false) {
    const list = FS.readdirSync(this.torrentsPath);

    const result: any[] = [];

    list.forEach((name: any) => {
      let basename = PATH.basename(name, ".torrent");
      let torrentFile = PATH.join(this.torrentsPath, name);
      let resumeFile = PATH.join(this.resumePath, `${basename}.resume`);

      if (FS.existsSync(torrentFile) && FS.existsSync(resumeFile)) {
        let resume = this.parser.decode(resumeFile);

        // 如果指定了源目录，当目录不匹配时，跳过当前种子
        if (sourcePath && resume.destination != sourcePath) {
          return;
        }

        console.log("正在解析 %s", name);

        let torrent: any = this.parser.parseTorrent(torrentFile);

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

    return result;
  }

  /**
   * 导出种子文件
   * @param from 指定目录
   * @param to 目标目录
   * @param saveAs 需要另存的 zip 文件
   */
  public export(
    from: string = "",
    to: string = "",
    saveAs: string = ""
  ): Promise<any> {
    return new Promise<any>((resolve?: any, reject?: any) => {
      console.log("开始分析种子文件, 源目录：%s, 目标目录：%s", from, to);
      const list = this.list(from, true);
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
        if (to && from != to) {
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
}
