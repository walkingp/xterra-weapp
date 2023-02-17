// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const db = cloud.database();
  const _ = db.command
  const regTable = db.collection("profile");
  const userTable = db.collection('userlist');
  const res = await userTable.where({ nickname: _.or(_.eq('微信用户'),_.eq(null))}).limit(1000).get();
  res.data.forEach(async item=>{
    const data = await regTable.where({ relation:'本人', userId: item._id }).get();
    debugger;
    console.log(data);
  });
  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}