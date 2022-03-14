// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const tj = require("togeojson");
const fs = require("fs");
const DOMParser= require("xmldom").DOMParser;


// 云函数入口函数
exports.main = async (event, context) => {
  const { gpxCloudUrl } = event;
  const file = await cloud.downloadFile({ fileID: gpxCloudUrl });
  const buffer = file.fileContent;
  const gpx = new DOMParser().parseFromString(buffer.toString('utf8'), "utf8");
  const converted = tj.gpx(gpx)
  console.log(converted);

  const res = await cloud.uploadFile({
    cloudPath: `upload/gpx/${new Date().getTime()}.json`,
    fileContent: JSON.stringify(converted)
  })
  return res;
}