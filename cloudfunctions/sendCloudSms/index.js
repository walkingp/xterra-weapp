const cloud = require('wx-server-sdk')
cloud.init()
exports.main = async (event, context) => {
  try {
    const result = await cloud.openapi.cloudbase.sendSms({
        env: 'xterra-c2969f', // 替换环境ID
        content: '访问XTERRA小程序',// 替换短信文案
        path: '/jump-mp.html',// 替换网页路径
        phoneNumberList: [
          "+8618521562202"
        ]
      })
    return result
  } catch (err) {
    return err
  }
}