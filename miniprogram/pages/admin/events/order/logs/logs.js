import { getLogs } from "../../../../../api/log";
import dayjs from "dayjs";

// pages/admin/events/order/logs/logs.js
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
    headers: [
      {
        prop: 'type',
        width: 152,
        label: '类型'
      },
      {
        prop: 'nickName',
        width: 200,
        label: '操作人',
      },
      {
        prop: 'addedDate',
        width: 250,
        label: '时间'
      },
      {
        prop: 'desc',
        width: 300,
        label: '内容'
      }
    ],
    stripe: true,
    border: true,
    outBorder: true,
    list: [],
    msg: '暂无数据',
    detail: null,
    results: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    async loadData(){
      wx.showLoading()
      const list = await getLogs();
      list.map(item => {
        item.addedDate = dayjs(item.createdAt).format("YYYY-MM-DD HH:mm:ss");
        item.nickName = item.userInfo?.[0].nickname;
        item.trueName = item.userInfo?.[0].truename;
        return item;
      });
      this.setData({ list });
      wx.hideLoading();
      this.triggerEvent("onLoaded", 'logs');
    },

  }
})
