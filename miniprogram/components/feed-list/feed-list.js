// components/feed-list/feed-list.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    list: {
      type: Array
    }
  },
  observers: {
    'list': function(list) {
      const feeds = list.map(item=>{
        const col = Math.ceil(24 / item.picUrls.length);
        if(col < 8) {
          item.cols = 8;
        }else{
          item.cols = col;
        }
        return item;
      });
      this.setData({
        feeds
      })
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    feeds: []
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
