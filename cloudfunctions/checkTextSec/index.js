// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const { content } = event;

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
    return {
      code: 0,
      msg: '正常'
    }
  }catch(err){
    return {
      code: -1,
      msg: '包含敏感字符'
    }
  }
}