Component({
  data: {
    show: false,
    color: "#535353",
    selectedColor: "#000000",
    backgroundColor: "#ffffff",
    list: [{
        pagePath: "/pages/index/index",
        text: "首页",
        iconPath: "/images/tabs/home@2x.png",
        selectedIconPath: "/images/tabs/home_fill@2x.png"
      },
      {
        pagePath: "/pages/events/events",
        text: "活动",
        iconPath: "/images/tabs/events@2x.png",
        selectedIconPath: "/images/tabs/events_fill@2x.png"
      },
      {
        pagePath: "/pages/news/news",
        text: "媒体中心",
        iconPath: "/images/tabs/news.png",
        selectedIconPath: "/images/tabs/news-fill.png"
      },
      {
        pagePath: "/pages/my/my",
        text: "我的",
        iconPath: "/images/tabs/my@2x.png",
        selectedIconPath: "/images/tabs/my_fill@2x.png"
      }
    ]
  },

  attached() {},
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