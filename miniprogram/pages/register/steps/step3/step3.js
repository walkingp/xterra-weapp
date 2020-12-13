const { updateOrderStatus } = require("../../../../api/race");
const { orderStatus } = require("../../../../config/const");

// pages/register/steps/step3/step3.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    order: {
      type: Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    money: 1,
    detail: null
  },
  observers: {
    'order': function(detail) {
      if(detail && detail.id){
        this.setData({
          detail
        });
      }
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    confirmOrder: function(e) {
      const { detail } = this.data;
      const that = this;
      const nonceStr = Math.random().toString(36).substr(2, 15)
      const timeStamp = parseInt(Date.now() / 1000) + ''
      const out_trade_no = "otn" + nonceStr + timeStamp
  
      wx.cloud.callFunction({
        name: "payment",
        data: {
          command: "pay",
          out_trade_no,
          body: detail.raceTitle,
          total_fee: detail.totalFee.toString()
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
      const { detail } = this.data;
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
            success: function(){
              updateOrderStatus({id:detail.id, ...orderStatus.paid }).then(res=>{
                console.log(res);
                wx.showToast({
                  icon: 'success',
                  title: '支付成功',
                  success: function(){
                    wx.redirectTo({
                      url: `/pages/register/status/status?id=${detail.id}`,
                    })
                  }
                })
              })
            }
          })
        },
        fail(res) {
          console.log("支付失败：", res);
          updateOrderStatus({id:detail.id, ...orderStatus.failed }).then(res=>{
            console.log(res);
            wx.showToast({
              icon: 'none',
              title: '支付失败',
              success: function(){
                wx.redirectTo({
                  url: `/pages/register/status/status?id=${detail.id}`,
                })
              }
            })
          });
        },
       complete(res) {
          console.log("支付完成：", res)
        }
      })
    },
  
    //退款
    refund: function() {
      const { detail } = this.data;
      let that = this;
      wx.cloud.callFunction({
        name: "payment",
        data: {
          command: "refund",
          out_trade_no: "test0005",
          body: detail.raceTitle,
          total_fee: 1,
          refund_fee: 1,
          refund_desc: '报名费退款'
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
