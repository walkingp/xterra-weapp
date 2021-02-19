// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const replyTable = db.collection("reply")
const feedTable = db.collection("feed")

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { userId, avatarUrl, content, feedId, nickName } = event;

  try{
    const secRes = await cloud.openapi.security.msgSecCheck({
      content
    })
    console.log(secRes);
    if(secRes.errCode !== 0){
      return {
        code: -1,
        msg: secRes.errMsg
      }
    }
  
    const res = await replyTable.add({
      data: {
        userId,
        avatarUrl,
        createdAt: new Date(),
        content,
        feedId,
        isActive: true,
        nickName
      }
    });
    const count = await replyTable.where({ feedId, isActive: true }).count();
    await feedTable.doc(feedId).update({
      data: {
        comments: count.total
      }
    })
    return {
      code: 0,
      ...res
    };
  }catch(err){
    return {
      code: -1,
      msg: '包含敏感字符'
    }
  }
}