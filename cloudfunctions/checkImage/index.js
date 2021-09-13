// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const fileID = event.fileID
  const res = await cloud.downloadFile({
    fileID: fileID,
  })
  const buffer = res.fileContent
  if(buffer.length > 1 * 1024 * 1024){
    return { errCode: 0, errMsg: '图片大于1MB' };
  }
  try {
    var result = await cloud.openapi.security.imgSecCheck({
      media: {
        contentType:event.contentType,
        value: buffer
      }
    })
    return result
  } catch (err) {
    return err
  }
}