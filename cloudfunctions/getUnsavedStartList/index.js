// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const { raceId } = event;

  const db = cloud.database();
  const res = db.collection("registration")
  .aggregate()
  .match({
    raceId,
    status: 1
  })
  .sort({
    addedDate: -1
  })
  .lookup({
    from: 'start-list',
    localField: 'orderNum',
    foreignField: 'orderNum',
    as: 'users',
  })
  .match({
    users: []
  })
  .limit(200)
  .end()

  return res;
}