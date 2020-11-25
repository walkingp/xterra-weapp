export const getPaginations = (args) => {
  const { dbName, orderBy, filter, pageIndex = 1, pageSize = 10 } = args;
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'pagination',
      data: {
        dbName,
        orderBy,
        filter,
        pageIndex,
        pageSize
      }
    }).then(res => {
      resolve(res.result.data);
    }).catch(reject)
  })
}