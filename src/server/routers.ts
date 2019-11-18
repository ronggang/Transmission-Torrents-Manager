// 导入基础库
import * as restify from "restify";
import { ManagerController } from "./controllers/manager";
import App from "./app";
import ERROR from "./interface/errorCodes";

export class Routers {
  public server: restify.Server;
  constructor(public app: App) {
    this.server = {} as any;
  }

  /**
   * 挂载路由
   */
  private mountRoutes(): void {
    let service = new ManagerController(this.app);

    // 获取列表
    this.server.get(
      "/api/list",
      (req: restify.Request, res: restify.Response, next: restify.Next) => {
        service.list(req, res, next);
      }
    );

    // 获取列表
    this.server.get(
      "/api/paths",
      (req: restify.Request, res: restify.Response, next: restify.Next) => {
        service.paths(req, res, next);
      }
    );

    // 导出
    this.server.post(
      "/api/export",
      (req: restify.Request, res: restify.Response, next: restify.Next) => {
        service.export(req, res, next);
      }
    );

    // 导入
    this.server.post(
      "/api/import",
      (req: restify.Request, res: restify.Response, next: restify.Next) => {
        service.import(req, res, next);
      }
    );

    // 获取配置
    this.server.get(
      "/api/config",
      (req: restify.Request, res: restify.Response, next: restify.Next) => {
        service.getConfig(req, res, next);
      }
    );

    // 静态页面
    this.server.get(
      "/*",
      restify.plugins.serveStatic({
        directory: __dirname + "/web",
        default: "index.html"
      })
    );
  }

  /**
   * 初始化插件
   */
  private initPlugins(server: restify.Server) {
    // 使用数据解析器
    server.use(restify.plugins.bodyParser(), restify.plugins.queryParser());

    // 设置允许跨域头信息
    server.use(function crossOrigin(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      return next();
    });
  }

  /**
   * 启动服务
   */
  public start() {
    let server = restify.createServer({
      name: this.app.config.server.name,
      version: this.app.config.server.version
    });

    this.initPlugins(server);

    this.server = server;
    this.mountRoutes();

    const port = this.app.config.server.port;

    server.listen(port, () => {
      console.log(
        "\n%s 服务已启动 \n本地端口：%s \n服务地址：%s \n%s \n使用说明：%s",
        this.server.name,
        port,
        `http://127.0.0.1:${port}/`,
        "-----------------------------------------",
        "https://github.com/ronggang"
      );
    });
  }
}
