// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { raceId } = event;
  const db = cloud.database();
  const data = db.collection("cert").aggregate().match({
    raceId
  }).lookup({
    from: 'cert-fields',
    localField: 'fields',
    foreignField: '_id',
    as: 'list'
  }).end();

  return data;
}