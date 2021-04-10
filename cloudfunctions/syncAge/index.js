// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const db = cloud.database();
  const _ = db.command
  const userTable = db.collection('start-list');
  const res = await userTable.where({ age: _.exists(false) }).limit(1000).get();
  res.data.forEach(async item=>{
    const { birthDate, _id } = item;
    const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
    await userTable.doc(_id).update({
      data: {
        age
      }
    })
  });
  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}