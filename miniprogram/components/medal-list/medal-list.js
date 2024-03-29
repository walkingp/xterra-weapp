// components/medal-list/medal-list.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    type: {
      type: String,
      value: 'thumbnail' // list
    },
    list: {
      type: Array
    }
  },
  observers: {
    'list': function (list) {
      if(list.length) {
        this.setData({
          loading: false
        })
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    loading: false
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
