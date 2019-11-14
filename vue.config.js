const path = require("path");
// 用于替换 @ 符号的路径
function resolve(dir) {
  return path.join(__dirname, "..", dir);
}

module.exports = {
  pages: {
    index: {
      // page 的入口
      entry: "./src/web/index.ts"
    }
  },
  productionSourceMap: false,
  outputDir: "./dist/web"
};
