// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const getRegistrations = (raceId, size = 1000) => {
  return new Promise((resolve, reject) => {
    try{
      cloud.callFunction({
        name: 'pagination',
        data: {
          dbName: 'registration',
          filter: {
            raceId
          },
          orderBy: {
            addedDate: 'desc'
          },
          pageIndex: 1,
          pageSize: size
        },
        success(res) {
          resolve(res.result)
        }
      });
    }catch(err){
      reject(err)
    }
  });
}
// 云函数入口函数
exports.main = async (event, context) => {
  const { raceId } = event;

  const db = cloud.database()
  const raceTable = db.collection("race");
  return new Promise(async (resolve, reject) => {
    const race = await raceTable.doc(raceId).get();
    const { title } = race.data;
    console.log(`开始读取${title}报名人数`);
    const res = await getRegistrations(raceId);
    
    res.map(item => {
      item.addedDate = dayjs(item.addedDate).format("YYYY-MM-DD HH:mm:ss");
      item.profiles = item.profiles && item.profiles.length ? item.profiles.map(p=>p.trueName).join() : '';
    });
    let orders = [['订单编号', '订单提交人', '类别', '赛事', '组别', '报名人数', '报名人', '订单状态', '订单金额', '优惠金额', '实付金额', '退款金额', '支付方式' ,'下单时间']];
    res.forEach(item => {
      let user = [];
      user.push(item.orderNum);
      user.push(item.userName);
      user.push(item.groupText);
      user.push(item.raceTitle);
      user.push(item.cateTitle);
      user.push(item.profileCount);
      user.push(item.profiles);
      user.push(item.statusText);
      user.push(item.totalFee);
      user.push(item.discountFee);
      user.push(item.paidFee);
      user.push(item.refundFee);
      user.push(item.orderType);
      user.push(item.addedDate);
      orders.push(user);
    })
  
    console.log(`共有订单${orders.length}`);
  
    const dateStr = dayjs().format("YYYY-MM-DD-HH-mm-ss");
    const fileName =  `${title}-${dateStr}完整订单表.xlsx`;
    const sheetName = '完整订单表';
    try{
      cloud.callFunction({
        name: 'exportCSV',
        data: {
          data: orders,
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