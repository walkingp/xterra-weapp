const dayjs = require("dayjs");
const { exportUsers } = require("../../../api/user");
const { getCollectionCount, getPaginations } = require("../../../utils/cloud");
const app = getApp();
// miniprogram/pages/admin/events/registration/registration.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    headers: [
      {
        prop: 'nickname',
        width: 152,
        label: '微信名'
      },
      {
        prop: 'truename',
        width: 152,
        label: '真实姓名'
      },
      {
        prop: 'gender',
        width: 80,
        label: '性别'
      },
      {
        prop: 'phonenumber',
        width: 152,
        label: '手机号'
      },
      {
        prop: 'email',
        width: 300,
        label: 'Email'
      },
      {
        prop: 'addedDate',
        width: 100,
        label: '注册时间'
      }
    ],
    stripe: true,
    border: true,
    outBorder: true,
    races: [],
    msg: '暂无数据',
    detail: null,
    results: [],
    pageIndex: 1,
    pageSize: 1000
  },
  loadMore(){
    const { pageIndex } = this.data;
    this.setData({
      pageIndex: pageIndex + 1
    }, () => {
      this.fetch();
    })
  },
  fixPinyin(){

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.checkLogin().then(res => {
      const isAdmin = res.userInfo.role === 'admin';
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
        this.fetch();
      }
    });
  },
  onCellClick(e){
    console.log(e.detail.target.dataset.it);
  },
  onRowClick(e){
    console.log(e.detail.target.dataset.it);
  },
  async fetch(){
    wx.showLoading({
      title: '加载中',
    })
    const { results, pageIndex, pageSize } = this.data;
    const total = await getCollectionCount({ dbName: 'userlist', filter: null});
    const newData = await getPaginations({ dbName: 'userlist', pageIndex, pageSize });
    newData.map(item => {
      item.addedDate = dayjs(item.addedDate).format("YYYY-MM-DD HH:mm:ss");
    });

    this.setData({
      total,
      results: results.concat(newData)
    }, () => {
      wx.hideLoading({
        success: (res) => {},
      })
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  async exportCSV() {
    wx.showLoading({
      title: '生成中……',
    })
    
    const res = await exportUsers();
    const url = res.fileList[0].tempFileURL;
    const filePath =  wx.env.USER_DATA_PATH + url.substr(url.lastIndexOf('/'));
    wx.downloadFile({
      // 示例 url，并非真实存在
      url,
      filePath,
      header: {
        "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      },
      success: function (res) {
        wx.openDocument({
          filePath,
          fileType: 'xlsx',
          showMenu: true,
          success: function (res) {
            wx.hideLoading({
              success: (res) => {},
            })
            console.log('打开文档成功')
          },
          fail: function (res) {    
            console.error(res)
            wx.showToast({title: '打开文档失败', icon: 'none', duration: 2000})    
          },
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})