const config = require("../config/config");
const {locale, locales} = require("../config/locale");

const i18n = {
  getLang(){
    const isChinese = wx.getStorageSync(config.storageKey.isChinese);
    if(isChinese !== ""){
      return wx.getStorageSync(config.storageKey.isChinese);
    }
    return false;
  },
  translate(){
    if(this.getLang()){
      let obj = {}; 
      Object.keys(locales).map(item=>{
          obj[item] = item;
      });
      return obj;
    }
    return locales;
  },
  billingual(cn, en){
    return this.getLang() ? cn : en;
  },
  translateText(key) {
    return getLang() ? key : this.translate()[key] || 'null';
  }
}

module.exports = {i18n};