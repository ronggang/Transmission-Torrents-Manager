import * as PATH from "path";
import * as FS from "fs";
import { IAppConfig } from "./interface/common";
import App from "./app";

function main() {
  let confPath = PATH.join(__dirname, "../config");
  let conf = PATH.join(confPath, "config.json");
  if (!FS.existsSync(conf)) {
    if (!FS.existsSync(confPath)) {
      FS.mkdirSync(confPath, {
        recursive: true
      });
    }

    let defaultConf: IAppConfig = {
      server: {
        port: 8088,
        name: "Transmission Torrents Manager",
        version: "0.0.1",
        transmissionPath: PATH.join(__dirname, "../transmission/")
      }
    };
    FS.writeFileSync(conf, JSON.stringify(defaultConf));
    new App(defaultConf);
    return;
  }

  try {
    let appConf: IAppConfig = JSON.parse(FS.readFileSync(conf, "utf-8"));

    new App(appConf);
  } catch (error) {
    console.log(error);
  }
}

main();
