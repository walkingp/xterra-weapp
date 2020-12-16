const { updateOrderStatus } = require("../../../../api/race");
const { orderStatus } = require("../../../../config/const");

// pages/register/steps/step3/step3.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    order: {
      type: Object
    }
  },

  observers: {
    'order': function(detail) {
      if(detail && detail.id){
        this.triggerEvent('onComplete', { prevEnabled: true, nextEnabled: true });
      }
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
  }
})
