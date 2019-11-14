-- 缓存数据
CREATE TABLE cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name NVARCHAR (500),
  fileName NVARCHAR (10),
  size INT,
  torrentData BLOB,
  updateTime INT
);