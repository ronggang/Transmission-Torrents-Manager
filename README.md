# Transmission Torrents Manager
`Transmission` 种子文件管理工具，主要用于 `Transmission` 种子文件迁移；

## 当前功能
- 批量导出并重新设置种子数据目录；
- 按保存目录导出种子文件；
- 导入已备份的种子文件；

## 安装
- 安装 [Docker](https://docker.com) 
- 拉取镜像
  ``` shell
  docker pull ronggang/ttmanager
  ```
- 部署示例
  ``` shell
  # Linux
  docker run -d -v /home/transmission/var:/app/transmission -v /test/config:/app/config -p 8088:8088 ronggang/ttmanager

  # Windows
  docker run -d -v "C:/Users/user1/AppData/Local/transmission":/app/storage -v "D:/test/config":/app/config -p 8088:8088 ronggang/ttmanager
  ```

- 数据目录
  - `/app/transmission` : 对应实际 `Transmission` 种子文件及 `resume` 文件所在目录，如：`/home/transmission/var`；
  - `/app/config` : 服务运行配置目录；

## 使用说明
- 安装完成后，用浏览器访问 `http://ip:port/` ；
- 如果安装正确，则可以看到类似以下界面：
  
  ![image](https://user-images.githubusercontent.com/8065899/69037153-4ae66380-0a22-11ea-85d6-7d41f753adf7.png) 

- 按界面上提示操作即可；
- 当进行导入/导出操作时，请停用 `Transmission` 后台服务；