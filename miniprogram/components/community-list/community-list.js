const dayjs = require("dayjs");
const { getCommentList } = require("../../api/community");

// components/community-list/community-list.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    list: {
      type: Array
    },
    type: {
      type: String
    }
  },

  observers: {
    'list': function(list){
      if(list.length) {
        const list1 = list.filter((item, index) => index % 2 === 0);
        const list2 = list.filter((item, index) => index % 2 !== 0);
        this.setData({
          lists: [ list1, list2 ]
        });
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    lists: [],
    list2: [],
    show: false,
    comments: null
  },

  /**
   * 组件的方法列表
   */
  methods: {
    preview(e){
      const { url, urls } = e.currentTarget.dataset;
      wx.previewImage({
        current: url,
        urls,
      })
    },
    async showComment(e){
      const { id } = e.currentTarget.dataset;
      const comments = await getCommentList(id);
      comments.map(item=>{
        item.dateStr = dayjs(item.createdAt).format("MM-DD HH:mm:ss");
        return item;
      })
      this.setData({
        comments,
        show: true
      })
      
    },
    onClose(){
      this.setData({
        show: false
      })
    },
  }
})
