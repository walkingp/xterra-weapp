const i18n = require("./../../utils/i18n");
// components/venue-list/venue-list.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    list: {
      type: Array,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    current: 0,
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
    prev() {
      let { current, list } = this.data;
      if (current === 0) {
        current = list.length - 1;
      } else {
        --current;
      }
      this.setData({
        current,
      });
    },
    next() {
      let { current, list } = this.data;
      if (current === list.length - 1) {
        current = 0;
      } else {
        ++current;
      }
      this.setData({
        current,
      });
    },
    redirect(e) {
      const { url } = e.currentTarget.dataset;
      wx.navigateTo({
        url,
      });
    },
  },
});
