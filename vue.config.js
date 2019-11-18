module.exports = {
  pages: {
    index: {
      // page 的入口
      entry: "./src/web/index.ts"
    }
  },
  productionSourceMap: false,
  outputDir: "./dist/web",
  devServer: {
    proxy: "http://localhost:8088"
  }
};
