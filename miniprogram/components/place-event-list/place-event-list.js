// components/place-event-list/place-event-list.js
const app = getApp();
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
    show: false,
    content: null
  },

  /**
   * 组件的方法列表
   */
  methods: {
    hideContent(){
      this.setData({
        show: false
      })
    },
    showContent(e){
      const { id } = e.currentTarget.dataset;
      const { list } = this.properties;
      const current = list.find(item=>item._id === id);
      if(current){
        this.setData({
          content: app.towxml(current.content, 'html'),
          show: true
        })
      }
    }
  }
})
