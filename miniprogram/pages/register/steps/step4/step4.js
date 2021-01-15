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
          wx.redirectTo({
            url: `/pages/my/registration/registration`
          })
        }
      });
    },
    sendMessage() {
      const { order } = this.properties;
      const { id, profiles } = order;
      const trueName = profiles.map(item => item.trueName).join();
      const phoneNum = profiles.map(item => item.phoneNum).join();
      wx.cloud.callFunction({
        name: "pushMessage",
        data: {
          templateId: config.messageTemplates.registration.templateId,
          action: 'sendSubscribeMessage',
          page: `pages/register/status/status?id=${id}`,
          name1: {
            value: trueName
          },
          phone_number2: {
            value: phoneNum
          },
          thing3: {
            value: order.raceTitle
          },
          amount4: {
            value: order.paidFee
          },
          time5: {
            value: dayjs(order.raceDate).format('YYYY年MM月DD日') 
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
    }
  }
})