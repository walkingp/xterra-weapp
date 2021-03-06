export const sendRegSMS = ({
  mobile,
  trueName,
  nationcode = '86',
  raceId,
  raceTitle,
  cateTitle
}) => {
  const templateId = 815140; // 注册成功
  const params = [raceTitle, cateTitle, trueName];
  let content = `亲爱的{3}，恭喜您已成功报名{1}{2}组别。请关注XTERRA微信公众号和微信小程序，查看比赛最新资讯和报名信息。`;
  params.forEach((param, index) => {
    content = content.replace(`{${index+1}}`, params[index]);
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
  const templateId = 824335; // 退款模板编号
  const params = [raceTitle, cateTitle, trueName];
  let content = `亲爱的{3}，恭喜您已取消报名{1}{2}组别，支付款将于24小时内退还到 原支付账户，如有任何问题，请及时与我们联系。请关注XTERRA微信公众号和微信小程序，查看比赛最新资讯和报名信息。`;
  params.forEach((param, index) => {
    content = content.replace(`{${index+1}}`, params[index]);
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