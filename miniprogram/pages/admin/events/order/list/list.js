import { getAllFailedRegistrations } from "../../../../../api/registration"
const dayjs = require("dayjs");

// pages/admin/events/order/list/list.js
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
        prop: 'orderNum',
        width: 400,
        label: '订单编号',
      },
      {
        prop: 'userName',
        width: 200,
        label: '订单提交人',
      },
      {
        prop: 'raceTitle',
        width: 152,
        label: '比赛'
      },
      {
        prop: 'cateTitle',
        width: 152,
        label: '组别'
      },
      {
        prop: 'statusText',
        width: 150,
        label: '报名状态'
      },
      {
        prop: 'profiles',
        width: 152,
        label: '报名人'
      },
      {
        prop: 'paidFee',
        width: 152,
        label: '付款金额'
      },
      {
        prop: 'addedDate',
        width: 152,
        label: '报名时间'
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
      const list = await getAllFailedRegistrations();
      list.map(item => {
        item.addedDate = dayjs(item.addedDate).format("YYYY-MM-DD HH:mm:ss");
        item.profiles = item.profiles && item.profiles.length ? item.profiles.map(p=>p.trueName).join() : ''
      });
      this.setData({ list });
      wx.hideLoading();
      this.triggerEvent("onLoaded", 'order');
    },

    onRowClick: function(e) {
      const { orderNum } = e.detail.target.dataset.it;
      this.triggerEvent("onSelect", orderNum);
    },
  }
})
