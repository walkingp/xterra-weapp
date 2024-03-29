const {
  removeRegistration, getStartUserDetailByOrderNum
} = require("../../api/race");
const { hideCollectionById } = require("../../utils/cloud");
const i18n = require("./../../utils/i18n");
// components/reg-list/reg-list.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    list: {
      type: Array
    }
  },
  lifetimes: {
    attached(){
      this.setData({
        _t: i18n.i18n.translate()
      })
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    show: false,
    actions: [{
      name: '删除',
    }],
    selectedId: null
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onClose() {
      this.setData({ show: false });
    },
  
    onSelect(event) {
      const { name } = event.detail;
      if(name === '删除'){
        this.removeReg();
      }
    },
    onShowDelete(e) {
      const {
        id
      } = e.currentTarget.dataset;
      this.setData({
        show: true,
        selectedId: id
      })
    },
    async removeReg(){
      const { selectedId } = this.data;
      const data = await removeRegistration(selectedId);
      await hideCollectionById({ dbName: 'registration', id: selectedId })
      const that = this;
      if(data){
        wx.showToast({
          icon: 'success',
          title: '删除成功',
          success: function(){
            that.triggerEvent('onRemoved',{ data })
          }
        })
      }
    }
  }
})