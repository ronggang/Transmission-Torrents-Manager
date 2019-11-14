#!/usr/bin/env node

import * as PATH from "path";
import * as program from "commander";
import * as inquirer from "inquirer";
import * as figlet from "figlet";
import * as chalk from "chalk";

import { Manager } from "./class/manager";

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

    if (!options.source) {
      promps.push({
        type: "input",
        name: "source",
        message: "请输入需要导出的种子数据所在目录（默认为所有）："
      });
    }

    if (!options.to) {
      promps.push({
        type: "input",
        name: "to",
        message: "请输入目标路径，如果不指定，则和源种子保存目录相同："
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
      inquirer.prompt(promps).then(answers => {
        this.confirm(Object.assign(options, answers));
      });
    }
  }

  private confirm(options: any) {
    const messages: string[] = [];
    messages.push("请确认以下信息：");
    messages.push("----------------------------------");
    messages.push(`Transmission 种子信息目录：${options.var}`);
    messages.push("----------------------------------");
    if (options.source) {
      messages.push(`指定目录：${options.source} `);
    } else {
      messages.push(`指定目录：<所有种子> `);
    }

    if (options.to) {
      messages.push(`目标目录：${options.to}`);
    } else {
      messages.push(`目标目录：保持不变`);
    }

    messages.push(`输出文件：${options.file} `);

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
          const manager = new Manager(options.var);
          manager.export(options.source, options.to, options.file);
        }
      });
  }
}
new App();
