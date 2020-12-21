// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const couponTable = db.collection("coupon")
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { id, ...param } = event;
  const result = await couponTable.doc(id).update({
    data: {
      ...param
    }
  });
  return result;
}