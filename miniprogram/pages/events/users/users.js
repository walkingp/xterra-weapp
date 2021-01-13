const {
  getPaginations
} = require("../../../utils/cloud")
const app = getApp();
const dayjs = require("dayjs");
const {
  getRaceDetail,
  getRaceCatesList,
  getAllRaces
} = require("../../../api/race");
const {updateStartListStatus, updateStartListStatusByUser } = require("../../../api/result");
const { raceResultStatus } = require("../../../config/const");
const { exportReport } = require("../../../api/user");
// miniprogram/pages/events/users/users.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    startListId: null,
    city: null,
    raceId: null,
    cateId: null,
    detail: null,
    race: null,
    currentCate: null,
    allCates: [],
    raceValue: '',
    cateValue: '',
    users: [],
    races: [{
      text: '请选择',
      value: ''
    }],
    cates: [{
      text: '请选择',
      value: ''
    }],
    show: false,
    value: 20,
    stats: '已报名',
    buttonText: '置为已完成',
    isPlogging:false
  },  
  copy(e) {
    const {
      text
    } = e.currentTarget.dataset;
    wx.setClipboardData({
      data: text,
    })
  },
  async updateStatus(e){
    wx.showLoading({
      title: '操作中',
    })
    const { city, detail } = this.data;
    let { finishedStatus, cardNo, cateId } = detail;
    if(finishedStatus === raceResultStatus.done.value){
      finishedStatus = raceResultStatus.DNS.value;
    }else if(finishedStatus === raceResultStatus.notStart.value || finishedStatus === raceResultStatus.DNS.value){
      finishedStatus = raceResultStatus.done.value;
    }
    const data = await updateStartListStatusByUser({cateId, cardNo, city, finishedStatus});
    this.fetchCates();
    wx.showToast({
      icon: 'success',
      title: '已修改',
      success: (res) => {
        this.setData({
          show: false
        })
      },
    })
  },
  setFinished() {
    const {
      cateId, city
    } = this.data;
    const that = this;
    wx.showModal({
      title: '提示',
      content: '确定全部设为已完成状态？',
      success: async function (sm) {
        if (sm.confirm) {
          const res = await updateStartListStatus({
            city,
            cateId
          });
          wx.showToast({
            title: '设置完成',
            success: function(){
              that.fetchCates();
            }
          })
          // 用户点击了确定 可以调用删除方法了
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    app.checkLogin().then(async res => {
      const {
        userId
      } = res;
      const isSuperAdmin = res.userInfo.role === 'admin';
      this.setData({
        userId,
        isSuperAdmin
      });

      const {
        id
      } = options;
      await this.fetchAllRaces();
      this.setData({
        raceId: id,
        raceValue: id
      }, () => {
        this.fetchCates();
      });
    }).catch(err => {
      wx.showLoading({
        title: '您没有权限',
      })
    });
  },
  async onChange(e) {
    const {
      type
    } = e.currentTarget.dataset;
    const value = e.detail;
    const {
      allCates
    } = this.data;
    switch (type) {
      case 'race':
        this.setData({
          raceValue: value,
          raceId: value
        }, () => {
          this.fetchCates();
        })
        break;
      case 'cate':
        this.setData({
          cateValue: value,
          cateId: value
        })
        await this.fetchCates();
        const currentCate = allCates.find(item => item._id === value);
        const {
          users
        } = this.data;
        this.setData({
          currentCate,
          value: currentCate.limit === 0 ? 98 : Math.floor(users.length / currentCate.limit * 100),
          stats: `${users.length}/${currentCate.limit === 0 ? '不限制' : currentCate.limit}`
        });
        break;
    }
  },
  onClose() {
    this.setData({
      show: false
    })
  },
  copy(e) {
    const {
      text
    } = e.currentTarget.dataset;
    wx.setClipboardData({
      data: text,
    })
  },
  call(e) {
    const {
      phone
    } = e.currentTarget.dataset;
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },
  async showDetail(e) {
    const {
      id
    } = e.currentTarget.dataset;
    const {
      users
    } = this.data;
    const detail = users.find(item => item._id === id);
    detail.statusText = raceResultStatus[detail.finishedStatus || "notStart"].title;
    const buttonText = detail.finishedStatus === raceResultStatus.notStart.value || detail.finishedStatus === raceResultStatus.DNS.value ? '置为已完成' : '置为未完成'
    this.setData({
      startListId: id,
      show: true,
      buttonText,
      detail
    })
  },

  async exportCSV() {
    wx.showLoading({
      title: '生成中……',
    })
    const that = this;
    const {
      cateId
    } = this.data;
    const res = await exportReport(cateId);
    const url = res.fileList[0].tempFileURL;
    const fileName = url.substr(url.lastIndexOf('/') + 1);
    wx.downloadFile({
      // 示例 url，并非真实存在
      url,
      header: {
        "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      },
      success: function (res) {
        const filePath = res.tempFilePath
        wx.openDocument({
          filePath: filePath,
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
  async fetchAllRaces() {
    let races = await getAllRaces();
    races = races.map(race => {
      return {
        text: `${race.title}`,
        id: race._id,
        value: race._id,
      }
    })
    races.splice(0, 0, ...this.data.races);
    this.setData({
      races
    })
  },

  async fetchCates() {
    const {
      raceId,
      cateId
    } = this.data;
    let race = null;
    if(raceId){
      race = await getRaceDetail(raceId);
      this.setData({
        city: race.city || race.title.replace(/.*Plogging\s+(.+?)站/,'$1'),
        isPlogging: race.type === 'X-Plogging'
      });
      wx.setNavigationBarTitle({
        title: race.title,
      })
    }
    wx.showLoading({
      title: '加载中',
    })

    let cates = [{
      text: '请选择',
      value: ''
    }];
    let _cates = await getRaceCatesList(raceId);
    this.setData({
      allCates: _cates
    })
    _cates = _cates.map(cate => {
      return {
        text: `${cate.title}`,
        id: cate._id,
        value: cate._id,
      }
    })
    cates.push(..._cates);

    const filter = cateId ? { cateId } : null;
    let users = await getPaginations({
      dbName: 'start-list',
      filter,
      orderBy: {
        createdAt: 'desc'
      },
      pageIndex: 1,
      pageSize: 100
    });
    users = users.map(item => {
      item.birthDate = dayjs(new Date(item.birthDate)).format("YYYY-MM-DD");
      item.regDate = dayjs(new Date(item.createdAt)).format("YYYY-MM-DD HH:mm:ss");
      return item;
    })

    this.setData({
      stats: `已报名${users.length}人`,
      users,
      race,
      cates,
    }, () => {
      wx.hideLoading({
        success: (res) => {},
      })
    })
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