const {
  updateOrderStatus,
  getMyCoupons
} = require("../../../../api/race");
const {
  orderStatus
} = require("../../../../config/const");
const app = getApp();

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
  data: {
    coupon: '暂无',
    coupons: []
  },

  lifetimes: {
    attached() {
      this.fetch();
    }
  },

  observers: {
    'order': function (detail) {
      if (detail && detail.id) {
        this.triggerEvent('onComplete', {
          prevEnabled: true,
          nextEnabled: true
        });
      }
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    async fetch() {
      wx.showLoading({
        title: '加载中……',
      })
      app.checkLogin().then(async res => {
        const {
          userId
        } = res;
        const coupons = await getMyCoupons(userId);
        this.setData({
          coupon: `${coupons[0].title}`,
          coupons
        })
      });
    }
  }
})