// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { userId } = event;
  const db = cloud.database();
  const res = await db.collection('point-goods')
  .aggregate()
  .lookup({
    from: 'goods',
    localField: 'goodId',
    foreignField: '_id',
    as: 'goods',
  }).match({
    userId
  })
  .end();
  return res;
}