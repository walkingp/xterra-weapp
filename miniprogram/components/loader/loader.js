// components/loader/loader.js
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
    winHeight: 0
  },
  lifetimes: {
    attached(){      
      const { winHeight } = getApp().globalData;
      this.setData({
        winHeight
      });
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
