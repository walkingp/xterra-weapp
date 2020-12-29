const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async (event, context) => {
  console.log(event)
  return sendSubscribeMessage(event);
}

async function sendSubscribeMessage(event) {
  const { templateId } = event;
  const { OPENID } = cloud.getWXContext()
  const { page, action, ...rest } = event;
  const sendResult = await cloud.openapi.subscribeMessage.send({
    touser: OPENID,           //要发送用户的openid
    page,        //用户通过消息通知点击进入小程序的页面
    lang: 'zh_CN',      //进入小程序查看”的语言类型，支持zh_CN(简体中文)、en_US(英文)、zh_HK(繁体中文)、zh_TW(繁体中文)，默认为zh_CN
    data: {
      ...rest
    },
    templateId,   //订阅消息模板ID
    miniprogramState: 'formal'   //跳转小程序类型：developer为开发版；trial为体验版；formal为正式版；默认为正式版
  })

  return sendResult
}