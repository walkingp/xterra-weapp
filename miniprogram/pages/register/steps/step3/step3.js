// pages/register/steps/step3/step3.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    money: 1
  },

  /**
   * 组件的方法列表
   */
  methods: {
    confirmOrder: function() {
      const that = this;
      const nonceStr = Math.random().toString(36).substr(2, 15)
      const timeStamp = parseInt(Date.now() / 1000) + ''
      const out_trade_no = "otn" + nonceStr + timeStamp
      const fee = this.data.money;
  
      wx.cloud.callFunction({
        name: "payment",
        data: {
          command: "pay",
          out_trade_no,
          body: '2021年XTERRA报名',
          total_fee: fee.toString()
        },
        success(res) {
          console.log("云函数payment提交成功：", res.result)
          that.pay(res.result)
        },
        fail(res) {
          console.log("云函数payment提交失败：", res)
        }
      })
    },
    pay(payData) {
      //官方标准的支付方法
      wx.requestPayment({ //已经得到了5个参数
        timeStamp: payData.timeStamp,
        nonceStr: payData.nonceStr,
        package: payData.package, //统一下单接口返回的 prepay_id 格式如：prepay_id=***
        signType: 'MD5',
        paySign: payData.paySign, //签名
  
        success(res) {
          console.log("支付成功：", res)
          wx.cloud.callFunction({  //巧妙利用小程序支付成功后的回调，再次调用云函数，通知其支付成功，以便进行订单状态变更
            name: "payment",
            data: {
              command: "payOK",
              out_trade_no: "test0004"
            },
          })
        },
        fail(res) {
          console.log("支付失败：", res)
        },
       complete(res) {
          console.log("支付完成：", res)
        }
      })
    },
  
    //退款
    refund: function() {
      let that = this;
      wx.cloud.callFunction({
        name: "payment",
        data: {
          command: "refund",
          out_trade_no: "test0005",
          body: '2021年XTERRA报名',
          total_fee: 1,
          refund_fee: 1,
          refund_desc: '押金退款'
        },
        success(res) {
          console.log("云函数payment提交成功：", res)
        },
        fail(res) {
          console.log("云函数payment提交失败：", res)
        }
      })
    },
  }
})
