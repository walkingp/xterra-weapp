// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database();
const _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const results = await db.collection("feed").where({
    keywords: _.eq(null)
  }).get();
  console.log(results);
  results.data.forEach(async item=> {
    const {content} = item;
    const keywords = await cloud.callFunction({
      name: 'getKeywords',
      data: {
        content
      }
    })
    console.log(keywords);
  })


  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}