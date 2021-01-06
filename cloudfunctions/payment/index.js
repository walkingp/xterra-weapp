//云函数实现微信支付
const cloud = require('wx-server-sdk')
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 步骤1、引入tenpay微信支付
const tenpay = require('tenpay');

// 步骤2、配置支付信息
const config = {
  appid: 'wx491fb14c7948a753',
  mchid: '1525969401',
  partnerKey: '3ybPBpsiqnnKPro9rYc7ghP3Dyti95JB',     //就是微信支付账户里面设置的API密钥
  pfx: require('fs').readFileSync('apiclient_cert.p12'),      //这是pfx格式的证书，支付不用证书，但是退款什么的会用到
  notify_url: 'http://www.weixin.qq.com/wxpay/pay.php', //随便写一个，云函数无法实现返回结果，但有巧妙的方法实现同样功能
  spbill_create_ip: '127.0.0.1'   //随便写一个，为一些POS场合用的
};

// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()

  //步骤3，初始化支付
  const api = tenpay.init(config);

  //步骤4，调用，想用一个云函数实现全部支付功能，包括支付、退款、查询等
  switch (event.command) {
    case "pay":  //支付功能
    console.log("pay, event, wxContext.OPENID", event, wxContext.OPENID);
      return await api.getPayParams({
        out_trade_no: event.out_trade_no,   //这是商户的订单号，要求商户内唯一
        body: event.body,
        total_fee: event.total_fee,       //订单金额(单位是分),
        openid: wxContext.OPENID   //付款用户的openid，直接拿就行
      })
      break

    case "payOK":    //想利用微信小程序得到付款成功消息后，给云函数来一个通知，解决付结果返回没有服务器的问题
      console.log("en payOK, I known:", event.out_trade_no);
      break

    case "refund":    //退款功能
      console.log("refund, event, wxContext.OPENID", event, wxContext.OPENID);
      return await api.refund({
        // transaction_id, out_trade_no 二选一
        // transaction_id: '微信的订单号',
        out_trade_no: event.out_trade_no,    //商户订单号
        out_refund_no: event.out_trade_no + 're',  //商户退款订单号，要求商户内唯一
        total_fee: event.total_fee,  //原单订单金额(单位是分)
        refund_fee: event.refund_fee,
        refund_desc: event.refund_desc
      })
      // 相关默认值:
      // op_user_id - 默认为商户号(此字段在小程序支付文档中出现)
      // notify_url - 默认为初始化时传入的refund_url, 无此参数则使用商户后台配置的退款通知地址
      break
  }
}