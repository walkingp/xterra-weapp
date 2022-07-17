// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const { uid } = event;
  const db = cloud.database();
  const _ = db.command;
  return db.collection('profile')
  .aggregate()
  .match(_.or([{
    userId: uid
  },{
    _id: uid
  }]))
  .lookup({
    from: 'userlist',
    localField: 'userId',
    foreignField: '_id',
    as: 'userInfo',
  })
  .end();
}