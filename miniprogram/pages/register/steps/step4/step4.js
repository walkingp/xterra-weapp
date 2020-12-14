// pages/register/steps/step4/step4.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {

    redirect(e){
      const { url } = e.currentTarget.dataset;
      wx.navigateTo({
        url
      })
    },
  }
})
