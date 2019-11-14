import * as restify from "restify";
import App from "../app";
import { Manager } from "../class/manager";

export class ManagerController {
  public service: Manager;
  constructor(public app: App) {
    this.service = new Manager(app.config.server.transmissionPath);
  }

  /**
   * 获取资源列表
   * @param req
   * @param res
   * @param next
   */
  public list(req: restify.Request, res: restify.Response, next: restify.Next) {
    const list = this.service.list(req.params.path);

    res.json({
      data: list
    });

    next();
  }

  /**
   * 导出
   * @param req
   * @param res
   * @param next
   */
  public export(
    req: restify.Request,
    res: restify.Response,
    next: restify.Next
  ) {
    this.service.export(req.params.from, req.params.to).then(result => {
      res.send(200, result, {
        "Content-Type": "application/octet-stream",
        "Content-Disposition":
          "attachment; filename=" + (req.params.saveAs || "export.zip")
      });
    });
    next();
  }

  /**
   * 路径信息
   * @param req
   * @param res
   * @param next
   */
  public paths(
    req: restify.Request,
    res: restify.Response,
    next: restify.Next
  ) {
    this.service.paths().then(result => {
      res.json({
        data: result
      });
    });
    next();
  }
}
