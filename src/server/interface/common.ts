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
