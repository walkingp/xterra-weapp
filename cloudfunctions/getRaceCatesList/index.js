// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { raceId } = event;
  const db = cloud.database();
  const data = db.collection('race-cates')
  .aggregate()
  .match({
    raceId,
    isActive: true
  })
  .sort({
    order: -1
  })
  .lookup({
    from: 'start-list',
    localField: '_id',
    foreignField: 'cateId',
    as: 'users',
  })
  .end()

  return data;
}