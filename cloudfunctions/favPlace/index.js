// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const {
    userId,
    placeId,
    type = 'place'
  } = event;
  const db = cloud.database();
  const res = await db.collection("fav").where({
    placeId,
    userId,
    type
  }).get();
  const isFaved = res.data.length > 0;
  if (isFaved) {
    return await db.collection("fav").where({
      placeId,
      userId,
      type
    }).remove();
  }
  return await db.collection("fav").add({
    data: {
      placeId,
      userId,
      type,
      addedDate: new Date(),
    }
  });
}