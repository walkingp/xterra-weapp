// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const db = cloud.database();
  const _ = db.command
  const regTable = db.collection("registration");
  const userTable = db.collection('start-list');
  const res = await userTable.where({ out_trade_no: _.eq(null)}).limit(1000).get();
  res.data.forEach(item=>{
    const data = await regTable.where({ orderNum: item.orderNum }).get()
    console.log(data);
  });
  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}