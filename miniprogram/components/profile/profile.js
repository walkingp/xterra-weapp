// components/profile/profile.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    detail: {
      type: Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {

    copy(e) {
      const {
        text
      } = e.currentTarget.dataset;
      wx.setClipboardData({
        data: text,
      })
    },
  }
})
