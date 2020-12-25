const { getFieldsByCateId } = require("../../../api/race");
import areaList from "./../../../config/area";
// miniprogram/pages/events/form/form.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentId: null,
    id: null,
    loading: false,
    fields: null,
    actions: [],
    areaList: areaList,
    showAddrPicker: false,
    showAction: false,
    defaultBirthDate: new Date(1990,0,15).getTime(),
    minDate: new Date(1920, 1, 1).getTime(),
    maxDate: new Date().getTime(),
    areaValue: 310000
  },
  async fetch(id){
    wx.showLoading({
      title: '加载中...',
    });
    const fields = await getFieldsByCateId(id);

    console.table(fields);
    this.setData({
      fields,
    }, () => {
      wx.hideLoading({
        success: (res) => {},
      })
    })
  },
  onLoad: function (options) {
    const { id } = options;
    this.setData({
      id
    });
    this.fetch(id);
  },
  onSelect(e){
    const { currentId, fields } = this.data;
    fields.map(item=>{
      if(item._id === currentId){
        item.value = e.detail.name;
      }
    });
    this.setData({
      fields
    });
  },
  onInputChanged(e){
    const { fields } = this.data;
    const { value } = e.detail;
    const { id } = e.currentTarget.dataset;
    fields.map(item=>{
      if(item._id === id){
        item.value = value;
      }
    });
    this.setData({
      fields
    });
  },
  submitData(e){
    const { fields } = this.data;
    try{
      fields.map(item => {
        if(item.isRequired && !item.value){
          wx.showToast({
            icon: 'none',
            title: `${item.title}不可为空`,
          });
          item.error = `${item.title}不可为空`;
          throw new Error('null')
        }
      });
      this.setData({
        fields
      })
    }catch(e){
      console.error(e)
    }
  },
  showAddr(e){
    const { id } = e.currentTarget.dataset;
    this.setData({
      currentId: id,
      showAddrPicker: true
    })
  },
  onAddConfirm(e){
    const { values } = e.detail;
    console.log(values);
    const region = values.map(item=>item.name).join('');
    const value = values[2].code;
    const { fields, currentId } = this.data;
    fields.map(item=>{
      if(item._id === currentId){
        item.value = value;
        item.region = region;
      }
    });

    this.setData({
      showAddrPicker: false,
      fields
    })
  },
  showPicker(e){
    const { id, options } = e.currentTarget.dataset;
    if(options.length){
      const actions = options.map(item=>{
        return {
          name: item
        }
      })
      this.setData({
        currentId: id,
        showAction: true,
        actions
      })
    }
  },
  onCancel(){
    this.setData({
      showAction: false
    })
  },
  onClose(){
    this.setData({
      showAction: false
    })
  },
  onShowDate(e){
    const { id } = e.currentTarget.dataset;
    this.setData({
      currentId: id,
      showDatePicker: true
    })
  },
  onDateCancel(){
    this.setData({
      showDatePicker: false
    })
  },  
  onDateConfirm(e){
    debugger
    console.log(e.detail);
    this.setData({
      birthDate: dayjs(e.detail).format("YYYY年MM月DD日"),
      defaultBirthDate: e.detail,
      showDatePicker: false
    })
  },
})