export const sendRegSMS = ({
  mobile,
  trueName,
  nationcode = '86',
  raceId,
  raceTitle,
  cateTitle
}) => {
  const templateId = 1058554; // 注册成功
  const params = [trueName, raceTitle, cateTitle, trueName, raceTitle, cateTitle];
  let content = `亲爱的{1}，恭喜您已成功报名{2}{3}。请关注XTERRA微信公众号和微信小程序，查看活动最新资讯和报名信息。 Dear {4}，Congratulations! You are now registered for the {5} {6}. Please follow XTERRA WeChat Official Account for most updated info.`;
  params.forEach((param, index) => {
    content = content.replace(`{${index + 1}}`, param);
  });

  wx.cloud.callFunction({
    name: 'sendSMS',
    data: {
      templateId,
      mobile,
      nationcode,
      params
    },
    success: async res => {
      console.log('[云函数] [sendsms] 调用成功')
      console.log(res)
      const smsParam = {
        trueName,
        phoneNum: mobile,
        raceId,
        raceTitle,
        cateTitle,
        content,
        _createTime: new Date()
      };
      const data = await saveSentSMS(smsParam);
      console.log(`sendsms日志已保存`, data)
    },
    fail: err => {
      console.error('[云函数] [sendsms] 调用失败', err)
    }
  })
}

export const sendRefundSMS = ({
  mobile,
  trueName,
  nationcode = '86',
  raceId,
  raceTitle,
  cateTitle
}) => {
  const templateId = 1058711; // 退款模板编号
  const params = [raceTitle, cateTitle, trueName];
  let content = `亲爱的{1}，您已成功取消报名{2}{3}，支付款将于24小时内退还到 原支付账户，如有任何问题，请及时与我们联系。请关注XTERRA微信公众号和微信小程序，查看活动最新资讯和报名信息。 Dear {4}, you have successfully cancelled your registration {5} {6}. The payment will be returned to the original payment account within 24 hours. If you have any questions, please contact us. Please follow XTERRA WeChat official account and WeChat mini program for the latest XTERRA information.`;
  params.forEach((param, index) => {
    content = content.replace(`{${index + 1}}`, param);
  });

  wx.cloud.callFunction({
    name: 'sendSMS',
    data: {
      templateId,
      mobile,
      nationcode,
      params
    },
    success: async res => {
      console.log('[云函数] [sendsms] 调用成功')
      console.log(res)
      const smsParam = {
        trueName,
        phoneNum: mobile,
        raceId,
        raceTitle,
        cateTitle,
        content,
        _createTime: new Date()
      };
      const data = await saveSentSMS(smsParam);
      console.log(`sendsms日志已保存`, data)
    },
    fail: err => {
      console.error('[云函数] [sendsms] 调用失败', err)
    }
  })
}

export const saveSentSMS = async param => {
  const db = wx.cloud.database();
  const result = await db.collection("sentSMS").add({
    data: { ...param }
  });
  return result;
}