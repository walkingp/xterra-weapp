import { getCollectionById } from "../utils/cloud";
const dayjs = require("dayjs");

export const getUserDetail = async id => {
  const data = await getCollectionById({ dbName: 'userlist', id });
  return data;
}

export const exportReport = async cateId => {
  const db = wx.cloud.database()
  const cateTable = db.collection("race-cates");
  const usersTable = db.collection("start-list")
  return new Promise(async (resolve, reject) => {
    const cate = await cateTable.doc(cateId).get();
    const { title } = cate.data;
    console.log(`开始读取${title}报名人数`);
    const res = await usersTable.where({ cateId }).limit(1000).get();
    let users = [['姓名', '性别', '手机号', '微信号','国籍','证件类型','证件号码','出生日期','邮箱','所属俱乐部','血型','衣服尺码', '省份', '住址','紧急联系人','紧急联系人手机', '是否参加过X-Plogging']];
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
      user.push(item.region);
      user.push(item.addr);
      user.push(item.contactUser);
      user.push(item.contactUserPhone);
      user.push(item.plogging);
      users.push(user);
    })
  
    console.log(`共有报名人数${users.length}`);
  
    const dateStr = dayjs().format("YYYY-MM-DD-HH-mm-ss");
    const fileName =  `${title}-${dateStr}完整报名表.xlsx`;
    const sheetName = '完整报名表';
    try{
      wx.cloud.callFunction({
        name: 'exportCSV',
        data: {
          data: users,
          fileName,
          sheetName
        },
        success(res) {
          resolve(res.result)
        }
      });
    }catch(err){
      reject(err)
    }
  })
}