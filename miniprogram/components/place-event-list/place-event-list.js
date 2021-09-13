<<<<<<< HEAD
const i18n = require("./../../utils/i18n");
=======
// components/place-event-list/place-event-list.js
>>>>>>> b9e7367006069f33940f96daa9502cad52ea4cb4
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

<<<<<<< HEAD
  pageLifetimes: {
    show: function() {
      this.setData({
        _t: i18n.i18n.translate()
      })
    },
  },
=======
>>>>>>> b9e7367006069f33940f96daa9502cad52ea4cb4
  /**
   * 组件的初始数据
   */
  data: {
<<<<<<< HEAD
    current: 0,
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
=======
    show: false,
    content: null
  },
>>>>>>> b9e7367006069f33940f96daa9502cad52ea4cb4

  /**
   * 组件的方法列表
   */
  methods: {
<<<<<<< HEAD
    prev(){
      let { current, list } = this.data;
      if(current === 0){
        current = list.length - 1;
      }else{
        --current;
      }
      this.setData({
        current
      });
    },
    next(){
      let { current, list } = this.data;
      if(current === list.length - 1){
        current = 0;
      }else{
        ++current;
      }
      this.setData({
        current
      });
    },
=======
>>>>>>> b9e7367006069f33940f96daa9502cad52ea4cb4
    hideContent(){
      this.setData({
        show: false
      })
    },
<<<<<<< HEAD
    
    redirect(e){
      const { url } = e.currentTarget.dataset;
      wx.navigateTo({
        url
      })
    },
=======
>>>>>>> b9e7367006069f33940f96daa9502cad52ea4cb4
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
