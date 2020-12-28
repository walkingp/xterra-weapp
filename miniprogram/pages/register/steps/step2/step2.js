const {
  getMyProfilesWithCate, checkIsRegistered
} = require("../../../../api/race")
const app = getApp();
// pages/register/userlist/userlist.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    raceId: {
      type: String
    },
  },


  /**
   * 组件的初始数据
   */
  data: {
    profiles: []
  },
  lifetimes: {
    attached: function () {
      this.fetch();
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
        const { userId } = res;
        const { cateId } = app.globalData.order;
        let profiles = await getMyProfilesWithCate(userId, cateId);
        console.log(profiles)
        this.setData({
          profiles
        }, () => {
          wx.hideLoading({
            success: (res) => {},
          })
        });
      })
    },
    checkboxChanged(e){
      const profileIds = e.detail.value;
      let { profiles } = this.data;
      profiles = profiles.filter(item => {
        return profileIds.includes(item._id);
      });
      app.globalData.order.profiles = profiles;
      app.globalData.order.profileCount = profiles.length;
      const totalFee = app.globalData.order.price * profiles.length;
      app.globalData.order.totalFee = totalFee.toFixed(2);
      app.globalData.order.paidFee = totalFee.toFixed(2);
      app.globalData.order.discountFee = 0;
      this.triggerEvent('onComplete', { prevEnabled: true, nextEnabled: profileIds.length > 0 });
    },
    gotoAdd(e){
      const { url } = e.currentTarget.dataset;
      wx.navigateTo({
        url
      })
    }
  }
})
