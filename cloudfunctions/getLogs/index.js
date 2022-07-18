// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const { pageIndex, pageSize } = event;
  const db = cloud.database();
  return db.collection('logs')
  .aggregate()
  .sort({
    createdAt: -1
  })
  .lookup({
    from: 'userlist',
    localField: 'userId',
    foreignField: '_id',
    as: 'userInfo',
  })
  .skip((pageIndex - 1) * pageSize)
  .limit(pageSize)
  .end();
}