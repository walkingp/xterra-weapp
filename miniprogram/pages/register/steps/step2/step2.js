const {
  getMyProfiles
} = require("../../../../api/race")
const app = getApp();
// pages/register/userlist/userlist.js
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
        const profiles = await getMyProfiles(userId);
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
      this.triggerEvent('onComplete', { prevEnabled: true, nextEnabled: profileIds.length > 0 });
      app.globalData.order.profiles = profiles;
      app.globalData.order.profileCount = profiles.length;
      app.globalData.order.totalFee = app.globalData.order.price * profiles.length;
    },
    gotoAdd(){
      wx.navigateTo({
        url: '/pages/register/form/form?action=register',
      })
    }
  }
})
