const i18n = require("./../../utils/i18n");
// components/venue-list/venue-list.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    list: {
      type: Array
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },
  lifetimes: {
    attached(){
      this.setData({
        _t: i18n.i18n.translate()
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    redirect(e){
      const { url } = e.currentTarget.dataset;
      wx.navigateTo({
        url,
      })
    },
  }
})
