// 云函数入口文件
const cloud = require('wx-server-sdk')
const xlsx = require('node-xlsx');
const dayjs = require("dayjs");

cloud.init()

const db = cloud.database()
const cateTable = db.collection("race-cates");
const usersTable = db.collection("start-list")
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  try{
    const { cateId } = event;
    const cate = await cateTable.doc(cateId).get();
    const { title } = cate.data;
    console.log(`开始读取${title}报名人数`);
    const res = await usersTable.where({ cateId }).limit(1000).get();
    let users = [['姓名', '性别', '手机号', '微信号','国籍','证件类型','证件号码','出生日期','邮箱','所属俱乐部','血型','衣服尺码','住址','紧急联系人','紧急联系人手机', '是否参加过X-Plogging']];
    res.data.forEach(item => {
      let user = [];
      user.push(item.trueName);
      user.push(item.gender);
      user.push(item.phoneNum);
      user.push(item.wechatid);
      user.push(item.nation);
      user.push(item.cardType);
      user.push(item.cardNo);
      user.push(dayjs(item.birthDate).format("YYYY-MM-DD"));
      user.push(item.email);
      user.push(item.club);
      user.push(item.bloodType);
      user.push(item.tSize);
      user.push(item.region + item.addr);
      user.push(item.contactUser);
      user.push(item.contactUserPhone);
      user.push(item.plogging);
      users.push(user);
    })

    console.log(`共有报名人数${users.length}`);

    const dateStr = dayjs().format("YYYY-MM-DD-HH-mm-ss");
    const csvFileName =  `${title}-${dateStr}完整报名表.xlsx`;

    console.log(`开始生成文件${csvFileName}`);
    const buffer = await xlsx.build([{
      name: '完整报名表',
      data: users
    }])
    console.log(`开始上传文件${csvFileName}`);
    const file = await cloud.uploadFile({
      cloudPath: 'reports/' + csvFileName,
      fileContent: buffer, //excel二进制文件
    })

    return await cloud.getTempFileURL({
      fileList: [file.fileID]
    });
  } catch (e) {
    console.error(e)
    return e
  }
}