const app = getApp();
// pages/register/steps/step4/step4.js
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
    'order': function (detail) {
      if (detail && detail.id) {
        let emails = [];
        detail.profiles.forEach(item=> {
          emails.push(item.email);
        })
        this.setData({
          emails
        })
      }
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    emails: []
  },

  /**
   * 组件的方法列表
   */
  methods: {

    redirect(e){
      const { url } = e.currentTarget.dataset;
      app.globalData.step = 0;
      wx.redirectTo({
        url
      })
    },
  }
})
