Component({
  data: {
    show: false,
    color: "#535353",
    selectedColor: "#000000",
    bottom: 0,
    backgroundColor: "#ffffff",
    list: [{
        pagePath: "/pages/index/index",
        text: "首页",
        iconPath: "/pages/tabs/home@2x.png",
        selectedIconPath: "/pages/tabs/home_fill@2x.png"
      },
      {
        pagePath: "/pages/events/events",
        text: "活动",
        iconPath: "/pages/tabs/events@2x.png",
        selectedIconPath: "/pages/tabs/events_fill@2x.png"
      },
      {
        pagePath: "/pages/community/index/index",
        bulge: true,
        iconPath: "/pages/tabs/radar-filled.png",
        selectedIconPath: "/pages/tabs/radar-filled.png"
      },
      {
        pagePath: "/pages/news/news",
        text: "媒体中心",
        iconPath: "/pages/tabs/news.png",
        selectedIconPath: "/pages/tabs/news-fill.png"
      },
      {
        pagePath: "/pages/my/my",
        text: "我的",
        iconPath: "/pages/tabs/my@2x.png",
        selectedIconPath: "/pages/tabs/my_fill@2x.png"
      }
    ]
  },

  attached() {    
      let screenHeight = wx.getSystemInfoSync().screenHeight
      let bottom = wx.getSystemInfoSync().safeArea.bottom
      console.log(screenHeight - bottom)
      this.setData({
        bottom: screenHeight - bottom
      })
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({
        url
      })
    }
  }
})