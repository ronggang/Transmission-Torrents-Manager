# 第一层，基础依赖和编译源码
FROM node:alpine as builder
# 工作路径
ARG APP_PATH="/app"
ENV TZ Asia/Shanghai
ARG registry=https://registry.npm.taobao.org
ARG disturl=https://npm.taobao.org/dist
RUN yarn config set disturl $disturl
RUN yarn config set registry $registry
# 复制安装包所需要的文件 ./yarn.lock
COPY ./package.json ./tsconfig.json ./vue.config.js $APP_PATH/
# 设置工作路径
WORKDIR $APP_PATH
# 安装环境
RUN yarn install
# 复制源码
COPY ./src $APP_PATH/src
# 复制公用文件
COPY ./public $APP_PATH/public
# 编译源码并清理编译环境
RUN yarn build && yarn clean && yarn install --production

# 第二层，运行环境
FROM node:alpine
MAINTAINER ronggang
# 默认端口
EXPOSE 8088
# 工作路径
ARG APP_PATH="/app"
# 设置虚拟卷，以方便外部指定
VOLUME ["$APP_PATH/transmission", "$APP_PATH/config"]
# 复制安装包所需要的文件
COPY ./package.json $APP_PATH/
# 设置工作路径
WORKDIR $APP_PATH
# 复制依赖包
COPY --from=builder $APP_PATH/node_modules ./node_modules
# 复制源码
COPY --from=builder $APP_PATH/dist $APP_PATH/dist
# 启动程序
CMD ["node", "./dist/index.js"]