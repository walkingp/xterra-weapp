const { getCollectionByWhere } = require("../../../../utils/cloud");
import dayjs from "dayjs";
import { addLog } from "../../../../api/log";
import { adminChangeStatus } from "../../../../api/pay";
import { getStartListByOrderNum } from "../../../../api/user";

// pages/admin/events/order/order.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active: "search",
    show: false,
    orderNum: '',
    detail: null,
    options: ['发送短信', '发送邮件'],
    result: ['发送短信', '发送邮件'],
    certPics: [],
    btnDisabled: true,
    canEdit: true,
    loaded: {
      order: false,
      logs: false
    },
  },
  onTabChange(event) {
    const name = event.detail.name;
    if(name === 'list' && !this.data.loaded.order) {
      const list = this.selectComponent("#list");
      list.loadData();
    }
    if(name === 'logs' && !this.data.loaded.logs) {
      const logs = this.selectComponent("#logs");
      logs.loadData();
    }
    this.setData({
      active: event.detail.name
    })
  },
  onLoaded(arg) {
    this.setData({
      [`loaded.${arg}`]: true
    })
  },
  onSelect(e) {
    const orderNum = e.detail;
    this.setData({
      orderNum, active: 'search'
    });
    this.queryNow();
  },
  uploadToCloud(event) {
    const that = this;
    let { fileList = [], certPics = [] } = this.data;
    const { file } = event.detail;
    let files = [ ...file ];
    wx.cloud.init();
    if (files.length === 0) {
      wx.showToast({
        title: '请选择图片',
        icon: 'none'
      });
    } else {
      wx.showLoading({
        title: '上传中...',
      })
      const uploadTasks = files.map((item) => this.uploadFilePromise(`upload/admin/${dayjs().format("YYYYMMDD")}/${new Date().getTime()}.png`, item));
      Promise.all(uploadTasks)
        .then(async data => {
          const newFileList = data.map(item => ({ url: item.fileID }));
          fileList.push(...newFileList);
          wx.showToast({ title: '上传成功', icon: 'none' });
          const btnDisabled = fileList.length === 0;
          const newFiles = data.map(item => item.fileID);
          certPics.push(...newFiles);
          that.setData({ cloudPath: data, fileList, certPics, btnDisabled });
        })
        .catch(e => {
          wx.showToast({ title: '上传失败', icon: 'none' });
          console.log(e);
        });
    }
  },
  uploadFilePromise(fileName, chooseResult) {
    return wx.cloud.uploadFile({
      cloudPath: fileName,
      filePath: chooseResult.url
    });
  },
  onChange(event) {
    this.setData({
      result: event.detail,
    });
  },
  async changeStatus(){
    const { orderNum, result, certPics, userId, detail } = this.data;
    const isSendEmail = result.includes('发送邮件');
    const isSendSms = result.includes('发送短信');
    
    const res = await adminChangeStatus(orderNum, isSendSms, isSendEmail, () => {
      const desc = `更改订单【${orderNum}】为已完成`;
      const result = addLog({ userId, type: '修改订单', targetUserId: detail.userId, desc,  certPics });
      wx.showToast({
        title: '更改完成',
        icon: "success"
      });
      this.setData({
        show: false
      });
      this.queryNow();
    });
  },
  toggle(event) {
    const { index } = event.currentTarget.dataset;
    const checkbox = this.selectComponent(`.checkboxes-${index}`);
    checkbox.toggle();
  },
  noop() {},
  showPopup(){
    this.setData({ show: true })
  },
  onClose() {
    this.setData({
      show: false
    })
  },
  query(e){
    const { orderNum } = e.detail.value;
    this.setData({ orderNum });
    this.queryNow();
  },
  async queryNow(){
    let { orderNum } = this.data;
    if(!orderNum){
      orderNum = '20220714054213501647';
    }
    wx.showLoading({
      title: '查询中',
    });
    const res = await getCollectionByWhere({
      dbName: 'registration',
      filter: {
        orderNum
      }
    });
    const detail = res[0];
    detail.orderTime = dayjs(new Date(detail.addedDate)).format("YYYY-MM-DD HH:mm:ss");

    const startUser = await getStartListByOrderNum(orderNum);
    let canEdit = true;
    if(startUser.length){
      canEdit = false;
    }
    this.setData({
      canEdit,
      detail
    });
    wx.hideLoading();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    getApp().checkLogin().then(res => {
      const { userId, userInfo } = res;
      const isAdmin = res.userInfo.role === 'admin';
      this.setData({ userId, userInfo });
      if(!isAdmin){
        wx.showToast({
          icon: 'none',
          title: '你没有管理员权限',
          success: () => {
            setTimeout(() => {
              wx.switchTab({
                url: '/pages/my/my',
              })
            }, 1000);
          }
        })
      }else{
        const { orderNum } = options;
        if(orderNum){
          this.setData({ orderNum});
          this.queryNow();
        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})