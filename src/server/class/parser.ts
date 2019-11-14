import * as FS from "fs";
import * as Bencode from "bencode";
import * as parseTorrent from "parse-torrent";

/**
 * resume 文件解析
 * 格式：https://github.com/transmission/transmission/wiki/Transmission-Resume-Files
 */
export class Parser {
  constructor() {}

  public decode(file: string) {
    const fileData = FS.readFileSync(file);

    let result = Bencode.decode(fileData, undefined, undefined, "utf8");
    return result;
  }

  public encode(data: any) {
    return Bencode.encode(data);
  }

  public parseTorrent(file: string) {
    return parseTorrent(FS.readFileSync(file));
  }
}
