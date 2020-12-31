// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
const startListTable = db.collection("start-list");

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { action, cateId, userId, finishedStatus = 'done' } = event;
  let result = null;
  switch(action){
    case 'batch':
      result = startListTable.where({
        cateId
      }).update({
        data: { finishedStatus }
      })
      break;
    case 'single':
      result = startListTable.where({
        cateId, userId
      }).update({
        data: { finishedStatus }
      })
      break;
  }
  return result;
}