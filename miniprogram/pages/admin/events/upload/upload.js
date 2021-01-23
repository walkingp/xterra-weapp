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
    mode: '跳过',
    selectedIndex: 0
  },
  downloadTemplate(){
    wx.showLoading({
      title: '打开中',
    })
    const { detail } = this.data;
    const { templateFile,title } = detail;
    wx.cloud.getTempFileURL({
      fileList: [templateFile],
      success: res =>{
        const url = res.fileList[0].tempFileURL;
        const filePath =  wx.env.USER_DATA_PATH + '/' + title + '线下报名模板.xlsx';
        wx.downloadFile({
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
      }
    })
  },
  showMode(){
    const actions = [
      {
        name: '跳过',
        subname: '如遇到相同证件号的直接跳过'
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
    const { selectedIndex, files, raceId, mode } = this.data;
    const file = files[selectedIndex].tmplFile;
    if(!file){
      wx.showToast({
        title: '未选择文件',
        icon: 'none'
      });
      return;
    }
    wx.showLoading({
      title: '导入中',
    })
    wx.cloud.callFunction({
      name: 'importCSV',
      data: {
        fileID: file,
        raceId,
        mode: mode === '覆盖' ? 'replace' : 'ignore'
      },
      success(res){
        const { succCount, failedCount } = res.result;
        wx.showToast({
          icon: 'none',
          title: `${succCount}条导入成功，${failedCount}条导入失败。`,
        })
      },
      fail(err){
        console.error(err);
        wx.showToast({
          icon: 'none',
          title: `全部导入失败`,
        })
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