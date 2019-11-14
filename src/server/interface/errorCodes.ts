const ERROR = {
  PermissionDenied: {
    code: 10001,
    msg: "Permission Denied"
  },

  MaxResourceLimit: {
    code: 10002,
    msg: "Maximum resource limit"
  },

  InvalidRequest: {
    code: 10003,
    msg: "Invalid request"
  },

  InvalidResourceId: {
    code: 10004,
    msg: "Invalid request id"
  },

  InvalidResourceName: {
    code: 10005,
    msg: "Invalid request name"
  },

  InvalidResourcePath: {
    code: 10006,
    msg: "Invalid resource path"
  },

  InvalidResourceData: {
    code: 10007,
    msg: "Invalid resource data"
  }
};

export default ERROR;
