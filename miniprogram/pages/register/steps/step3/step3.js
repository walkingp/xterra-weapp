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

  observers: {
    'order': function(detail) {
      if(detail && detail.id){
        this.triggerEvent('onComplete', { prevEnabled: true, nextEnabled: true });
      }
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
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
