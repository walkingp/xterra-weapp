const i18n = require("./../../utils/i18n");

// components/medal-list/medal-list.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: {
      type: Object
    },
    size: {
      type: String
    }
  },
  pageLifetimes: {
    show: function() {
      this.setData({
        _t: i18n.i18n.translate()
      })
    },
  },
  lifetimes: {
    attached(){
      this.setData({
        _t: i18n.i18n.translate()
      })
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
    async redirect(e){
      const { url } = e.currentTarget.dataset;
      wx.navigateTo({
        url,
      })
    }
  }
})
