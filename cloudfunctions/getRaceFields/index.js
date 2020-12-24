// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const $ = db.command.aggregate
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { cateId } = event;
  return new Promise((resolve, reject) => {
    db.collection('fields').aggregate().lookup({
      from: "race-cates",
      localField: '_id',
      foreignField: 'fields',
      as: 'fieldList'
    }).end().then(res=>{
      resolve(res)
    }).catch(err=>{
      reject(err)
    })
  });
}