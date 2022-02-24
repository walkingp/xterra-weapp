const { getBannerList } = require("../../api/race");

// components/banner-list/banner-list.js
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
    tapItem(e){
      let { src, type, url, bannerid } = e.currentTarget.dataset;
      const { list } = this.properties;
      const urls = list.map(item=>item.picUrl);
      switch(type){
        case 'preview':
          wx.previewImage({
            urls,
            current: src
          });
          break;
        case 'navigate':
          if(bannerid){
            getApp().globalData.bid = bannerid;
            url = `/pages/events/events`;
            wx.switchTab({
              url
            })
            return;
          }
          if(url && !url.startsWith('/')){
            url = '/' + url;
          }
          wx.navigateTo({
            url,
          });
          break;
      }
    }
  }
})
