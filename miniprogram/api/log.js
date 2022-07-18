export const addLog = async ({ userId, type, targetUserId, desc, certPics }) => {
  const db = wx.cloud.database();
  const logDB = db.collection("logs");
  return logDB.add({
    data: {
      userId, type, targetUserId, desc, certPics, createdAt: new Date()
    }
  });
}

export const getLogs = async (pageIndex = 1, pageSize = 20) =>{
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: "getLogs",
      data: { pageIndex, pageSize },
      success: (res) => {
        resolve(res?.result?.list);
      },
      fail: (err) => reject(err),
    });
  });
}