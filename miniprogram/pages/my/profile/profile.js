const { removeProfile } = require("../../../api/profile");
const { getMyProfiles } = require("../../../api/race");
const { sendRegSMS } = require("../../../api/sms");
const app = getApp();
const i18n = require("./../../../utils/i18n");

const _t = i18n.i18n.translate();
// miniprogram/pages/my/profile/profile.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    profiles: []
  },
  onClose(event) {
    const { position, instance } = event.detail;
    const { id } = event.target.dataset;
    const that = this;
    switch (position) {
      case 'left':
      case 'cell':
        instance.close();
        break;
      case 'right':
        wx.showModal({
          title: _t['提示'],
          content: _t['确定要删除吗？'],
          fail: console.log,
          success: async function (sm) {
            if (sm.confirm) {
                await removeProfile(id);
                that.fetch();
                // 用户点击了确定 可以调用删除方法了
                instance.close();
              } else if (sm.cancel) {
                console.log('用户点击取消')
              }
            }
          });
        break;
    }
  },
  gotoAdd(){
    wx.navigateTo({
      url: '/pages/register/form/form',
    })
  },
  async fetch(){
    wx.showLoading({
      title: _t['加载中……'],
    })
    const { userId } = app.globalData;
    if(!userId){
      wx.showToast({
        title: _t['没有登录'],
        icon: "none",
        success: ()=>{
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/my/my',
            })
          }, 1000);
        }
      })
    }
    const profiles = await getMyProfiles(userId);
    this.setData({
      profiles
    },() => {
      wx.hideLoading({
        success: (res) => {},
      })
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.checkLogin().then(res => {
      this.fetch();
    })
  },
})