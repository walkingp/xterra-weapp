// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database();
const _ = db.command;

const goodsTable = db.collection("goods");
const pointsTable = db.collection("points");
const usersTable = db.collection("userlist");
// 云函数入口函数
exports.main = async (event, context) => {
  const { goodId, userId, count } = event;
  const goods = await goodsTable.doc(goodId).get();
  const user = await await usersTable.doc(userId).get();
  if(goods.data.count === 0){
    return {
      code: -1,
      msg: '商品已兑换完'
    };
  }
  if(user.data.point < goods.data.point){
    return {
      code: -1,
      msg: '积分不足'
    };
  };
  await pointsTable.add({
    data: {
      createdAt: new Date(),
      extraData: {
        id: goods._id,
        title: '兑换积分商品'
      },
      rule: {
        point: goods.data.point,
        title: '兑换积分商品:' + goods.data.title
      },
      point: -goods.data.point,
      userId
    }
  });
  await goodsTable.doc(goodId).update({
    data: {
      count: _.inc(-1)
    }
  });
  await usersTable.doc(userId).update({
    data: {
      point: _.inc(-goods.data.point)
    }
  });

  return {
    code: 1,
    msg: '购买成功'
  }
}