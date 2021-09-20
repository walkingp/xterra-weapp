// 云函数入口文件
const cloud = require('wx-server-sdk')
var nodejieba = require("nodejieba");

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const { content = '高安驿站和宋明客厅，蛮好奇是做什么的地点？' } = event;
  const thresold = 4;
  const result = nodejieba.extract(content, thresold);
  console.log(result);
  return result;
}