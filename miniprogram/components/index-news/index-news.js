// components/index-news/index-news.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    news: {
      type: Array
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

    redirect(e) {
      const {
        url,
        wechaturl
      } = e.currentTarget.dataset;
      if (wechaturl) {
        wx.navigateTo({
          url: `/pages/more/webview/webview?url=${wechaturl}`,
        })
        return;
      }
      wx.navigateTo({
        url,
      })
    },
  }
})
