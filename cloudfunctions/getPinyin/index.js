// 云函数入口文件
const cloud = require('wx-server-sdk')
const pinyin = require("node-pinyin");
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const { word } = event;
  if(word === '重庆') {
    return [["chong"],["qing"]];
  }
  return pinyin(word, {style:'normal'});
}