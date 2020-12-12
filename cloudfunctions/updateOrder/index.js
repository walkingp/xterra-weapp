// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const orderTable = db.collection("registration")
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const { id, status, statusText } = event;
  const wxContext = cloud.getWXContext()
  try {
    return await orderTable.doc(id).update({
      data: {
        status,
        statusText
      },
    })
  } catch (e) {
    console.error(e)
  }
  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}