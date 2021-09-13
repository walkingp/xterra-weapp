<<<<<<< HEAD
const i18n = require("./../../utils/i18n");
=======
>>>>>>> b9e7367006069f33940f96daa9502cad52ea4cb4
// components/venue-list/venue-list.js
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
<<<<<<< HEAD
    current: 0
  },
  pageLifetimes: {
    show: function() {
      this.setData({
        _t: i18n.i18n.translate()
      })
    },
=======

>>>>>>> b9e7367006069f33940f96daa9502cad52ea4cb4
  },

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
    redirect(e){
      const { url } = e.currentTarget.dataset;
      wx.navigateTo({
        url,
      })
    },
  }
})
