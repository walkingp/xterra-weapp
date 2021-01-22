const { getRaceDetail } = require("../../../../api/race");
const { getExcels } = require("../../../../api/upload");

const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    raceId: null,
    show: false,
    detail: null,
    actions: [],
    files: [],
    radio: '0',
    type: '',
    mode: '追加',
    selectedIndex: 0
  },
  showMode(){
    const actions = [
      {
        name: '追加',
        subname: '直接追加到团队'
      },
      {
        name: '覆盖',
        subname: '如遇到相同证件号的直接覆盖'
      }
    ];
    this.setData({ actions, show: true });
  },
  onClose() {
    this.setData({ show: false });
  },
  showAction(){
    this.setData({ show: true});
  },
  onSelect(event) {
    console.log(event.detail);
    const { name } = event.detail;
    this.setData({
      type: name,
      mode: name
    })
  },
  onChange(event) {
    this.setData({
      radio: event.detail,
    });
  },
  saveNow(){
    const { selectedIndex, files, raceId } = this.data;
    const file = files[selectedIndex].tmplFile;
    debugger
    wx.cloud.callFunction({
      name: 'importCSV',
      data: {
        fileID: file,
        raceId
      },
      success(res){
        debugger
      },
      fail(err){
        debugger
      }
    });
  },
  onClick(event) {
    const { name } = event.currentTarget.dataset;
    this.setData({
      selectedIndex: name,
      radio: name,
    });
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
        const { raceId } = options;
        this.setData({
          raceId
        })
        this.fetch();
      }
    });
  },
  async fetch(){
    wx.showLoading({
      title: '加载中',
    })
    const { raceId } = this.data;
    const detail = await getRaceDetail(raceId);
    const files = await getExcels(raceId);
    files.map(file=>{
      file.fileName = file.tmplFile.substr(file.tmplFile.lastIndexOf('/') + 1);
      return file;
    });
    const actions = files.map(file=>{
      const name = file.tmplFile.substr(file.tmplFile.lastIndexOf('/') + 1);
      return {
        name,
        subname: file.isImported ? '上次导入过' : '未导入过'
      }
    })
    this.setData({
      detail,
      files,
      actions
    },()=>{
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