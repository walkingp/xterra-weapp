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

export const getCollectionById = (args) => {
  const { dbName, id } = args;
  return new Promise(async (resolve, reject) => {
    await wx.cloud.database().collection(dbName).doc(id).get().then(res=>{
      resolve(res.data);
    }).catch(err=>{
      reject(err)
    });
  })
}

export const getCollectionByWhere = (args) => {
  const { dbName, filter } = args;
  return new Promise(async (resolve, reject) => {
    await wx.cloud.database().collection(dbName).where(filter).get().then(res=>{
      resolve(res.data);
    }).catch(err=>{
      reject(err)
    });
  })
}