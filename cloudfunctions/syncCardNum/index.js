// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database();
  const _ = db.command
  const userTable = db.collection('start-list');
  const res = await userTable.where({
    data: {
      cardNo: db.RegExp({
        regexp: '\\t.*'
      })
    }
  }).limit(1000).get();
  res.data.forEach(async item => {
    const data = await userTable.doc(item._id).update({
      cardNo: item.cardNo.replace(/\s/g, '')
    })
    console.log(data);
  });
  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}