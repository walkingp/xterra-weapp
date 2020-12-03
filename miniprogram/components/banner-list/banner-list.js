const { getBannerList } = require("../../api/race");

// components/banner-list/banner-list.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    position: {
      type: String,
      value: 'index'
    }
  },

  lifetimes: {
    async attached(){
      const banners = await getBannerList(this.properties.position);
      this.setData({
        banners
      })
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    banners: [],
    current: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    swiperChange(e) {
      this.setData({
        current: e.detail.current
      })
    },
  }
})
