const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async (event, context) => {
  console.log(event)
  switch (event.action) {
    case 'requestSubscribeMessage': {
      return requestSubscribeMessage(event)
    }
    case 'sendSubscribeMessage': {
      return sendSubscribeMessage(event)
    }
  }
}

const templateId = 'Hb-YkJGF4ovdN9tu4VbA7243-JW6jS_4a9XeGUosUjE';

async function requestSubscribeMessage(event) {
  // 此处为模板 ID，开发者需要到小程序管理后台 - 订阅消息 - 公共模板库中添加模板，
  // 然后在我的模板中找到对应模板的 ID，填入此处
  return templateId // 如 'N_J6F05_bjhqd6zh2h1LHJ9TAv9IpkCiAJEpSw0PrmQ'
}

async function sendSubscribeMessage(event) {
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