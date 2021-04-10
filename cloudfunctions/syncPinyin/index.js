// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

const getPinyin = async word => {
  return new Promise((resolve, reject) => {
    cloud.callFunction({
      name: 'getPinyin',
      data: { word }
    }).then(res => {
      resolve(res.result);
    }).catch(reject)
  })
}

const getFullPinyin = async (value) => {
  const isChinese = new RegExp("[\\u4E00-\\u9FFF]+","g").test(value);
  if(!isChinese){
    const index = value.lastIndexOf(' ');
    return {
      pinyinFirst: value.substr(0, index),
      pinyinLast: value.substr(index + 1)
    };
  }
  const xing = value.substr(0,1);
  const ming = value.substr(1);
  
  let pinyinFirst = await getPinyin(ming);
  let pinyinLast = await getPinyin(xing);
  pinyinFirst = pinyinFirst.join('');
  pinyinLast = pinyinLast.join('');
  return {
    pinyinFirst: pinyinFirst ? pinyinFirst.replace(pinyinFirst[0],pinyinFirst[0].toUpperCase()).replace(/\s/g,"") : pinyinFirst,
    pinyinLast: pinyinLast.replace(pinyinLast[0], pinyinLast[0].toUpperCase())
  };
};

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const db = cloud.database();
  const _ = db.command
  const userTable = db.collection('start-list');
  const res = await userTable.where({ pinyinFirst: _.exists(false) }).limit(1000).get();
  res.data.forEach(async item=>{
    const { trueName, _id } = item;
    const { pinyinLast, pinyinFirst } = await getFullPinyin(trueName, {style:'normal'});
    // debugger;
    console.log(pinyinLast, pinyinFirst);
    await userTable.doc(_id).update({
      data: {
        pinyinLast, pinyinFirst
      }
    })
  });
  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}