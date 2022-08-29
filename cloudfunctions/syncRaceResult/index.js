// 云函数入口文件
const cloud = require('wx-server-sdk')
const dayjs = require("dayjs")

cloud.init()
const isDate = (data) => {
  return Object.prototype.toString.call(data) === "[object Date]";// isNaN(data) && !isNaN(Date.parse(data));
}
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database();
  const _ = db.command
  const userTable = db.collection('race-result');
  const res = await userTable.where({
    netTime: _.neq(null),
    cateId: '6d85a2b962aad2a60ae784331d606500'
  }).orderBy('netTime', 'asc').limit(1000).get();
  res.data.forEach(async (item, index) => {
    const data = await userTable.doc(item._id).update({
      data: { overallRank: index+ 1}
    });
   //if(isDate(item.netTime)){
  //   if(item.netTime?.indexOf('4:') === 0) {
  //     const data = await userTable.doc(item._id).update({
  //       //data: { netTime: dayjs(item.netTime).format("h:mm:ss") }
  //       data: { netTime: item.netTime.replace('4:', '0:')}
  //     })
  //     console.log(data);
  //   }
  //  // if(isDate(item.roughTime)){
  //   if(item.roughTime?.indexOf('4:') === 0) {
  //     const data = await userTable.doc(item._id).update({
  //       data: { roughTime: item.roughTime.replace('4:', '0:')}
  //       //data: { roughTime: dayjs(item.roughTime).format("h:mm:ss") }
  //     })
  //     console.log(data);
  //   }
  });
  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}