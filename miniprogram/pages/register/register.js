const { payNow } = require("../../api/pay");
const { getRaceDetail, updateOrderStatus } = require("../../api/race");
const { orderStatus } = require("../../config/const");
const app = getApp();
// miniprogram/pages/register/register.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: "",
    cateId: null,
    type: 'inidividual',
    isValid: false,
    step: 0,
    group: 0,
    order: null,
    prevEnabled: true,
    nextEnabled: false,
    teamTitle: null,
    steps: [
      {
        text: '选择组别',
      },
      {
        text: '选择报名人',
      },
      {
        text: '确认付款',
      },
      {
        text: '完成报名',
      },
    ],
  },
  couponChanged(e){
    const { couponId, discountFee, paidFee } = e.detail;
    app.globalData.order.discountFee = discountFee;
    app.globalData.order.paidFee = paidFee;
    app.globalData.order.couponId = couponId;
  },
  onComplete(e){
    const { prevEnabled, nextEnabled } = e.detail;
    this.setData({
      prevEnabled,
      nextEnabled
    });
  },
  prevStep(e){
    const step = this.data.step - 1;
    this.setData({
      nextEnabled: true,
      prevEnabled: false,
      isValid: false,
      step
    });
    app.globalData.step = step;
  },
  nextStep(e){
    let { step } = this.data;
    step = step + 1;
    this.setData({
      nextEnabled: false,
      prevEnabled: true,
      isValid: false,
      step
    });
    app.globalData.step = step;
    switch(step){
      case 0:
        break;
      case 1:
        break;
      case 2:
        this.order();
        break;
      case 3:
        this.confirmOrder();
        break;
    }
  },
  order(){
    wx.showLoading({
      title: '加载中',
    })
    let { order } = app.globalData;
    order.userId = app.globalData.userId;
    order.userName = app.globalData.userName;
    order.userInfo = app.globalData.userInfo;
    order.status = orderStatus.pending.status; // 待支付
    order.statusText = orderStatus.pending.statusText;
    order.isActive = true;
    order.orderType = '微信支付';
    wx.cloud.callFunction({
      name: 'saveOrder',
      data: {
        data: order
      }
    }).then(async res => {
      console.log(res);
      const { id, orderNum } = res.result;
      
      app.globalData.order.id = id._id;
      app.globalData.order.orderNum = orderNum;
      console.log(app.globalData.order);
      const { order } = app.globalData;
      this.setData({
        order
      }, () => {
        wx.hideLoading({
          success: (res) => {
          },
        })
      });
    }).catch(console.error)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {    
    app.checkLogin().then(res=>{    
      const { isLogined, userId, userInfo } = res;
      if(!isLogined){
        wx.showToast({
          icon: 'none',
          title: '请先登录',
          success: function(){
            setTimeout(() => {
              wx.switchTab({
                url: '/pages/my/my',
              })
            }, 1000);
          }
        });
        return;
      }
      // 添加报名人后返回
      if(app.globalData.step && app.globalData.step === 1){
        const { step } = app.globalData;
        this.setData({
          step
        });
      }
      const { id, cateId, type, teamTitle } = options;
      this.setData({
        id, cateId, type: type || 'individual', teamTitle
      });
      this.fetch(id);
    }).catch(err=>{
      wx.showToast({
        icon: 'none',
        title: '请先登录',
        success: function(){
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/my/my',
            })
          }, 1000);
        }
      });
    });
  },

  async fetch(id){
    wx.showLoading({
      title: '加载中',
    })
    const detail = await getRaceDetail(id);
    detail.disclaimer = app.towxml(detail.disclaimer,'html');
    this.setData({
      detail
    },() => {
      wx.hideLoading({
        success: (res) => {},
      })
    });
    const {title} = detail;
    wx.setNavigationBarTitle({
      title,
    })
  },
  
  confirmOrder: function(e) {
    const { order } = app.globalData;
    const that = this;
    payNow(order, () => {
      that.setData({
        step: 4
      })
    });
  },
    /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {
    const { detail, order } = this.data;
    if( options.from == 'button' ){
      const path = `/pages/register/register?id=${order.raceId}&type=relay&teamTitle=${order.teamTitle}`;
      console.log(path)
      return {
        title: `邀请你加入${order.raceTitle}: ${order.teamTitle}`,
        imageUrl: order.racePic[0],
        path
      }
　　}
    return {
      title: detail.title,
      imageUrl: detail.picUrls[0],
      path: `/pages/register/register?id=${detail._id}`
    }
  }
})