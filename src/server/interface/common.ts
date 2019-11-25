export interface IAppConfig {
  server: {
    version?: string;
    name: string;
    port: number;
    transmissionPath: string;
  };
}

export interface ITorrentItem {
  name: string;
  basename?: string;
  torrentFile?: string;
  resumeFile?: string;
  size: number;
  path: string;
  downloaded: number;
  resume?: any;
}

export enum EFilterType {
  All = 1,
  Folder = 2,
  Tracker = 3
}

export interface IExportOption {
  // 种子文件所在目录
  rootPath: string;
  // 过滤类型
  filterType?: EFilterType;
  filterValue?: string;
  targetPath?: string;
  outputFile?: string;
}
