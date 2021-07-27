// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const {
    userId,
    placeId
  } = event;
  const db = cloud.database();
  const res = await db.collection("medals").where({
    placeId,
    userId
  }).get();
  const isTicked = res.data.length > 0;
  if (isTicked) {
    return false;
    // return await db.collection("medals").where({
    //   placeId,
    //   userId
    // }).remove();
  }
  return await db.collection("medals").add({
    data: {
      placeId,
      userId,
      addedDate: new Date(),
    }
  });
}