const path = require("path");
// 用于替换 @ 符号的路径
function resolve(dir) {
  return path.join(__dirname, "..", dir);
}

module.exports = {
  pages: {
    index: {
      // page 的入口
      entry: "src/web/index.ts"
    }
  },
  productionSourceMap: false,
  outputDir: "dist/web"
  // configureWebpack: {
  //   resolve: {
  //     extensions: [".ts", ".tsx", ".js"],
  //     alias: {
  //       "@": resolve("src/web")
  //     }
  //   },
  //   module: {
  //     rules: [
  //       {
  //         test: /\.s(c|a)ss$/,
  //         use: [
  //           "vue-style-loader",
  //           "css-loader",
  //           {
  //             loader: "sass-loader",
  //             // Requires sass-loader@^7.0.0
  //             options: {
  //               implementation: require("sass"),
  //               fiber: require("fibers"),
  //               indentedSyntax: true // optional
  //             },
  //             // Requires sass-loader@^8.0.0
  //             options: {
  //               implementation: require("sass"),
  //               sassOptions: {
  //                 fiber: require("fibers"),
  //                 indentedSyntax: true // optional
  //               }
  //             }
  //           }
  //         ]
  //       }
  //     ]
  //   }
  // }
};
