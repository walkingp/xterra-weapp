const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})
exports.main = async (event, context) => {
  const { imgUrl } = event;
  try {
    const result = await cloud.openapi.ocr.idcard({
        "type": 'photo',
        "imgUrl": imgUrl
      })
    return result
  } catch (err) {
    return err
  }
}