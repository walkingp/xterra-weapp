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
const dayjs = require('dayjs');

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
    type: '活动',
    userId: null,
    userInfo: null,
    coupon: '暂无',
    _order: null,
    code: '',
    actions: [{
      type: 'input',
      name: '手动录入'
    }],
    show: false,
    inputVisible: false,
    discountFee: 0,
    paidFee: 0
  },

  lifetimes: {
    attached() {
      this.fetch();
    }
  },

  observers: {
    'order': function (detail) {
      if (detail && detail.id) {
        this.setData({
          type: ['越野跑', '铁人三项', '山地车'].indexOf(detail.type) < 0 ? '活动' : '赛事',
          _order: detail
        })
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
    checkCouponValid(detail){

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
      if(detail.assignedUserId){
        wx.showToast({
          title: '优惠券已被占用',
          icon: 'none'
        });
        return;
      }
      if(dayjs().isAfter(dayjs(detail.expiredDate))){
        wx.showToast({
          title: '优惠券已过期',
          icon: 'none'
        });
        return;
      }
      // 与赛事组别不符
      const { raceId, cateId } = this.data._order;
      if(detail.raceId && detail.raceId !== raceId){
        wx.showToast({
          title: '当前比赛不可使用',
          icon: 'none'
        });
        return;
      }
      if(detail.cateId && detail.cateId !== cateId){
        wx.showToast({
          title: '当前组别不可使用',
          icon: 'none'
        });
        return;
      }
    },
    async addCoupon(e){
      wx.showLoading({
        title: '请稍等',
      })
      const { coupon } = e.detail.value;
      const detail = await getCouponDetail(coupon);
      if(detail){
        const valided = this.checkCouponValid(detail);
        if(!valided){
          return;
        }
        const { userId, userInfo } = this.data;
        const param = {
          id: detail._id,
          assignedUserId: userId,
          assignedUserName: userInfo.truename || userInfo.nickname
        }
        const res = await updateCoupon(param)
        const { updated } = res.stats;
        if(updated){
          wx.showToast({
            title: '添加优惠券成功',
            icon: 'none',
            success: ()=>{
              const { _order } = this.data;
              const discountFee = detail.type === 'free' ? _order.totalFee : detail.value;
              const margin = _order.totalFee - detail.value < 0 ? 0 : _order.totalFee - detail.value;
              const paidFee = detail.type === 'free' ? 0 : margin;
              this.setData({
                inputVisible: false,
                discountFee,
                paidFee
              });
              this.triggerEvent('couponChanged',{
                couponId: detail._id,
                discountFee,
                paidFee
              })
            }
          })
        }
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
    async onSelect(event) {
      const { _order } = this.data;
      const { type, couponId } =  event.detail;
      switch(type){
        case 'input':
          this.setData({
            inputVisible: true
          })
          break;
        case 'none':
          this.setData({
            coupon: '不使用优惠券',
            discountFee: 0,
            paidFee: _order.totalFee
          });
          this.triggerEvent('couponChanged',{
            couponId: null,
            discountFee: 0,
            paidFee: _order.totalFee
          })
          break;
        default:
          const detail = await getCouponDetail(couponId);
          const valid = this.checkCouponValid(detail);
          if(!valid){
            return;
          }
          const discountFee = detail.type === 'free' ? _order.totalFee : detail.value;
          const margin = _order.totalFee - detail.value < 0 ? 0 : _order.totalFee - detail.value;
          const paidFee = detail.type === 'free' ? 0 : +margin.toFixed(2);
          this.setData({
            discountFee,
            paidFee
          });
          this.triggerEvent('couponChanged',{
            couponId: couponId,
            discountFee,
            paidFee
          })
          break;
      }
    },
    async fetch() {
      wx.showLoading({
        title: '加载中……',
      })
      const {
        userId,
        userInfo,
        order
      } = app.globalData;
      if(order){
        const { raceId, cateId } = order;
        this.setData({
          userId,
          userInfo,
        })
        let coupons = await getMyCoupons(userId);
        coupons = coupons.filter(item=>{
          const isRaceValid = !item.raceId || (item.raceId && item.raceId === raceId);
          const isCateValid = !item.cateId || (item.cateId && item.cateId === cateId);
          return item.isActive && !item.isUsed && dayjs().isBefore(dayjs(item.expiredDate)) && isRaceValid && isCateValid
        });
        let actions = [];
        if(coupons.length){
          actions = coupons.map(item=> {
            return {
              name: item.title,
              couponId: item._id,
              subname: '优惠金额：' + (item.type === 'free' ? '全免' : item.value),
              disabled: item.isActive || item.isUsed
            };
          });
          actions.push({
            type: 'none',
            name: '不使用优惠券'
          });
          const couponValue = coupons[0].value;
          const isFree = coupons[0].type === 'free';
          const discountFee = isFree ? order.totalFee : couponValue;
          const paidFee = isFree ? 0 : order.totalFee - couponValue < 0 ? 0 : order.totalFee - couponValue;
          this.setData({
            coupon: `${coupons[0].title}`,
            discountFee,
            paidFee,
            actions: [...actions, ...this.data.actions]
          }, () => {
            wx.hideLoading({
              success: (res) => {},
            })
          })
          this.triggerEvent('couponChanged',{
            couponId: coupons[0]._id,
            discountFee,
            paidFee
          })
        }else{
          const discountFee = 0;
          const paidFee = order.totalFee;
          this.setData({
            discountFee,
            paidFee
          }, () => {
            wx.hideLoading({
              success: (res) => {},
            })
          })
        }
      }else{
        const discountFee = 0;
        const paidFee = order.totalFee;
        this.setData({
          discountFee,
          paidFee
        }, () => {
          wx.hideLoading({
            success: (res) => {},
          })
        })
      }
    }
  }
})