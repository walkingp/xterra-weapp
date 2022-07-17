export const addLog = async ({ userId, targetUserId, desc, certPics }) => {
  const db = wx.cloud.database();
  const logDB = db.collection("logs");
  return logDB.add({
    data: {
      userId, targetUserId, desc, certPics, createdAt: new Date()
    }
  });
}