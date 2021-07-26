const i18n = require("./../../utils/i18n");
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
  lifetimes: {
    attached(){
      let { list } = this.properties;
      list.map(item => {
        item._title = i18n.i18n.getLang() ? item.title : item.titleEn;
        item._desc = i18n.i18n.getLang() ? item.desc : item.descEn;
        return item;
      })
      this.setData({
        _t: i18n.i18n.translate(),
        _c: i18n.i18n.getLang(),
        list
      })
    }
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
    
    redirect(e){
      const { url } = e.currentTarget.dataset;
      wx.navigateTo({
        url
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
