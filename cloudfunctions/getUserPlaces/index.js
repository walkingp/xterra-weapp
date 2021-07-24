// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const { userId } = event;
  const db = cloud.database();
  const res = await db.collection('feed')
  .aggregate()
  .match({
    userId,
    type: 'place'
  })
  .lookup({
    from: 'place',
    localField: 'placeId',
    foreignField: '_id',
    as: 'place',
  })
  .limit(100)
  .end();

  return res;
}