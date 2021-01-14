// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const orderTable = db.collection("registration")
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const { id, status, statusText, out_trade_no, refundTime, refundFee, paidFee, discountFee } = event;
  let data = { status, statusText };
  if(out_trade_no){
    data.out_trade_no = out_trade_no;
  }
  if(discountFee !== undefined){
    data.discountFee = discountFee;
  }
  if(paidFee !== undefined){
    data.paidFee = paidFee;
  }
  if(refundFee !== undefined){
    data.refundFee = refundFee;
  }
  if(refundTime){
    data.refundTime = refundTime;
  }
  const wxContext = cloud.getWXContext()
  try {
    return await orderTable.doc(id).update({
      data
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