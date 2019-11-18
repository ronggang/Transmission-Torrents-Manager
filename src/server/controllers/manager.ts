import * as restify from "restify";
import App from "../app";
import { Manager } from "../class/manager";
import ERROR from "../interface/errorCodes";

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
    // console.log("req.params", req);
    this.service.export(req.body.from, req.body.to).then(result => {
      res.send(200, result, {
        "Content-Type": "application/octet-stream",
        "Content-Disposition":
          "attachment; filename=" + (req.body.saveAs || "export.zip")
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

  /**
   * 获取配置信息
   * @param req
   * @param res
   * @param next
   */
  public getConfig(
    req: restify.Request,
    res: restify.Response,
    next: restify.Next
  ) {
    this.service.getConfig().then(result => {
      res.json({
        data: result
      });
    });
    next();
  }

  /**
   * 导入种子信息
   * @param req
   * @param res
   * @param next
   */
  public import(
    req: restify.Request,
    res: restify.Response,
    next: restify.Next
  ) {
    if (req.files && req.files.data) {
      this.service
        .import(req.files.data.path)
        .then(result => {
          res.json({
            data: result
          });
        })
        .catch(err => {
          res.json({
            error: err
          });
        });
    } else {
      res.send(400, ERROR.InvalidRequest);
    }

    next();
  }
}
