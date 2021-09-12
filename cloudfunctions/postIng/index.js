// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const feedTable = db.collection("feed")

// 云函数入口函数
exports.main = async (event, context) => {
  const { userId, avatarUrl, content, picUrls, nickName, type = 'feed', placeId = null, location } = event;

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
    const res = await feedTable.add({
      data: {
        userId,
        avatarUrl,
        addedDate: new Date(),
        content,
        picUrls,
        kudos: 0,
        comments: 0,
        status: '1',
        isActive: true,
        nickName,
        type,
        placeId,
        location
      }
    });
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