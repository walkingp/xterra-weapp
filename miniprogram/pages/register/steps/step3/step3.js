const {
  updateOrderStatus,
  getMyCoupons,
  getCouponDetail,
  updateCoupon
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
    userId: null,
    userInfo: null,
    coupon: '暂无',
    code: '',
    actions: [{
      name: '手动录入'
    }],
    show: false,
    inputVisible: false
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
    async addCoupon(e){
      const { coupon } = e.detail.value;
      const detail = await getCouponDetail(coupon);
      if(detail){
        if(detail.isActive === false){
          wx.showToast({
            title: '优惠券已失败',
            icon: 'none'
          });
          return;
        }
        if(detail.isUsed){
          wx.showToast({
            title: '优惠券已使用',
            icon: 'none'
          });
          return;
        }
        const { userId, userInfo } = this.data;
        const param = {
          id: detail._id,
          assignedUserId: userId,
          assignedUserName: userInfo.truename || userInfo.nickname
        }
        debugger
        const res = await updateCoupon(param)
      }
    },
    showAction(e){
      this.setData({
        show: true
      })
    },
    onClose() {
      this.setData({ show: false });
    },  
    onSelect(event) {
      const { name } =  event.detail;
      if(name === '手动录入'){
        this.setData({
          inputVisible: true
        })
      }
    },
    async fetch() {
      wx.showLoading({
        title: '加载中……',
      })
      app.checkLogin().then(async res => {
        const {
          userId,
          userInfo
        } = res;
        this.setData({
          userId,
          userInfo,
        })
        const coupons = await getMyCoupons(userId);
        const actions = coupons.map(item=> {
          return {
            name: item.title,
            subname: '金额：' + item.value,
            disabled: item.isActive || item.isUsed
          };
        });
        this.setData({
          coupon: `${coupons[0].title}`,
          actions: [...actions, ...this.data.actions]
        })
      });
    }
  }
})