#!/usr/bin/env node

import * as PATH from "path";
import * as program from "commander";
import * as inquirer from "inquirer";
import * as figlet from "figlet";
import * as chalk from "chalk";

import { Manager } from "./class/manager";
import { EFilterType } from "./interface/common";

class App {
  constructor() {
    this.initTitle();
    this.initCommander();
  }

  private initTitle() {
    console.log("\n");
    console.log(chalk.white("Transmission Torrents Export v0.0.1"));
    console.log(
      chalk.green(
        figlet.textSync("TTExport", {
          font: "Merlin1",
          horizontalLayout: "default",
          verticalLayout: "default"
        })
      )
    );

    console.log("\n");
  }

  private initCommander() {
    program
      .version("0.0.1")
      .option(
        "-r, --var <path>",
        "Transmission 的种子所在的上级目录，如：/home/transmission/var"
      )
      .option(
        "-s, --source <path>",
        "仅导出导出的保存目录 source 的种子，如果不指定，则导出所有种子"
      )
      .option("-t, --to <path>", "目标路径，如果不指定，则和源种子保存目录相同")
      .option(
        "-f, --file <path>",
        "输出的zip文件路径，默认为当前目录下 tr-export.zip",
        undefined,
        PATH.join(__dirname, "tr-export.zip")
      )
      .action(options => {
        this.parseOptions(options);
      });

    program.parse(process.argv);
  }

  private parseOptions(options: any) {
    const promps: any[] = [];

    if (!options.var) {
      promps.push({
        type: "input",
        name: "var",
        message: "请输入Transmission 种子信息目录：",
        validate: function(input) {
          if (!input) {
            return "不能为空";
          }
          return true;
        }
      });
    }

    promps.push({
      type: "list",
      message: "请选择导出类型：",
      name: "exportMode",
      choices: [
        { name: "1. 导出所有种子", value: 1 },
        { name: "2. 仅导出指定保存目录的种子", value: 2 },
        { name: "3. 仅导出指定 Tracker 的种子", value: 3 }
      ],
      validate: function(input) {
        if (!input) {
          return "请选择类型";
        }
        return true;
      }
    });

    promps.push({
      type: "input",
      name: "source",
      message: "请输入需要导出的种子数据所在目录：",
      when: answers => {
        return answers.exportMode === 2;
      }
    });

    promps.push({
      type: "input",
      name: "tracker",
      message: "请输入需要导出的 Tracker 域名：",
      when: answers => {
        return answers.exportMode === 3;
      }
    });

    if (!options.to) {
      promps.push({
        type: "list",
        message: "请选择处理目标路径方式：",
        name: "exportToMode",
        choices: [
          { name: "1. 和源目录保持一致", value: 1 },
          { name: "2. 将目标路径修改为自定义值", value: 2 }
        ],
        validate: function(input) {
          if (!input) {
            return "请选择类型";
          }
          return true;
        }
      });

      promps.push({
        type: "input",
        name: "to",
        message: "请输入目标路径：",
        when: answers => {
          return answers.exportToMode === 2;
        }
      });
    }

    if (!options.file) {
      promps.push({
        type: "input",
        name: "file",
        message: "请输入要输出的文件路径：",
        validate: function(input) {
          if (!input) {
            return "不能为空";
          }
          return true;
        }
      });
    }

    if (promps.length > 0) {
      inquirer.prompt(promps).then((answers: any) => {
        // this.confirm(Object.assign(options, answers));

        this.confirm({
          rootPath: answers.var,
          filterType: answers.exportMode,
          filterValue: answers.source || answers.tracker,
          targetPath: answers.to,
          outputFile: answers.file
        });
      });
    }
  }

  private confirm(options: any) {
    const messages: string[] = [];
    // console.log(options);
    messages.push("请确认以下信息：");
    messages.push("----------------------------------");
    messages.push(`Transmission 种子信息目录：${options.rootPath}`);
    messages.push("----------------------------------");

    switch (options.filterType) {
      case EFilterType.Folder:
        messages.push(`指定目录：${options.filterValue} `);
        break;

      case EFilterType.Tracker:
        messages.push(`指定Tracker：${options.filterValue} `);
        break;

      default:
        messages.push(`指定目录：<所有种子> `);
        break;
    }

    if (options.targetPath) {
      messages.push(`目标目录：${options.targetPath}`);
    } else {
      messages.push(`目标目录：保持不变`);
    }

    messages.push(`输出文件：${options.outputFile} `);

    messages.push("----------------------------------");
    messages.push("是否继续？");

    return inquirer
      .prompt([
        {
          type: "confirm",
          name: "confirm",
          message: messages.join("\n"),
          default: false
        }
      ])
      .then((answers: any) => {
        if (answers.confirm) {
          const manager = new Manager(options.rootPath);
          manager.export(options);
        }
      });
  }
}
new App();
