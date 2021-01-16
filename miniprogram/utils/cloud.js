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

export const sendEmail = ({ html, from, to, subject }) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'sendmail',
      data: { html, from, to, subject }
    }).then(res => {
      resolve(res.result.data);
    }).catch(reject)
  })
}

export const sendTencentEmail = ({ templateId, data, to, subject }) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'sendTencentCloudMail',
      data: { templateId, data, to, subject }
    }).then(res => {
      resolve(res);
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

export const removeCollectionById = (args) => {
  const { dbName, id } = args;
  return new Promise(async (resolve, reject) => {
    try {
      const res = await wx.cloud.database().collection(dbName).doc(id).remove();      
      resolve(res.stats.removed);
    } catch(e) {
      reject(e)
    }
  })
}

export const removeCollectionByWhere = (args) => {
  const { dbName, filter } = args;
  return new Promise(async (resolve, reject) => {
    try {
      const res = await wx.cloud.database().collection(dbName).where(filter).remove();      
      resolve(res.stats.removed);
    } catch(e) {
      reject(e)
    }
  })
}

export const hideCollectionById = (args) => {
  const { dbName, id } = args;
  return new Promise(async (resolve, reject) => {
    try{
      await wx.cloud.database().collection(dbName).doc(id).update({
        data: {
          isActive: false
        },
        success: function(res){
          resolve(res.stats);
        }
      })
    } catch(e) {
      reject(e)
    }
  })
}

export const getSingleCollectionByWhere = async arg => {
  const data = await getCollectionByWhere(arg);
  return data.length ? data[0] : null;
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