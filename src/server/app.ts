// 导入基础库
import * as restify from "restify";
import { IAppConfig } from "./interface/common";
import * as PATH from "path";
import * as FS from "fs";
import { Routers } from "./routers";
import * as extend from "extend";

/**
 * 默认APP
 */
class App {
  public routers: Routers = new Routers(this);
  public config: IAppConfig = {
    server: {
      port: 8088,
      name: "Transmission Torrents Manager",
      transmissionPath: PATH.join(__dirname, "../transmission/")
    }
  };
  public rootPath: string = "";

  constructor(config?: IAppConfig) {
    this.rootPath = PATH.join(__dirname, "../");
    this.config = extend(true, this.config, config);
    this.routers.start();
  }
}

export default App;
