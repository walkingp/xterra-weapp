const config = require("../../../../config/config");
const dayjs = require("dayjs");
const app = getApp();
// pages/register/steps/step4/step4.js
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
    'order': function (detail) {
      if (detail && detail.id) {
        let emails = [];
        detail.profiles.forEach(item => {
          emails.push(item.email);
        })
        this.setData({
          emails
        })
      }
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    emails: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    receiveMessage() {
      const templateId = config.messageTemplates.registration.templateId;
      const that = this;
      wx.requestSubscribeMessage({
        tmplIds: [templateId],
        success: async res => {
          that.sendMessage();
        },
        fail: res => {
          console.log(res);
          wx.showToast({
            icon: 'none',
            title: '用户已拒绝，请选择接受消息来获得最新通知',
          })
        }
      });
    },
    sendMessage() {
      const { order } = this.properties;
      const { _id } = order;
      wx.cloud.callFunction({
        name: "pushMessage",
        data: {
          action: 'sendSubscribeMessage',
          page: `pages/register/status/status?id=${_id}`,
          name1: {
            value: order.trueName
          },
          phone_number2: {
            value: order.profiles[0]?.phoneNum
          },
          thing3: {
            value: order.raceTitle
          },
          amount4: {
            value: order.paidFee
          },
          time5: {
            value: dayjs().format('YYYY年MM月DD日') 
          }
        },
        success: res => {
          wx.redirectTo({
            url: `/pages/my/registration/registration`
          })
        },
        fail: res => {
          console.error(res)
        }
      })
    },
    redirect(e) {
      const {
        url
      } = e.currentTarget.dataset;
      app.globalData.step = 0;
      this.receiveMessage();
    },
  }
})