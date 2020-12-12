export const storageKey = {
  userId: 'userId',
  order: 'order'
};

export const raceStatus = [
  { text: '报名中', value: 'ing', bgColor: '#49AA19', textColor: '#fff' },
  { text: '名额已满', value: 'full', bgColor: '#444', textColor: '#fff' },
  { text: '报名已截止', value: 'end', bgColor: '#444', textColor: '#fff' },
  { text: '比赛已结束', value: 'expired', bgColor: '#444', textColor: '#fff' },
];

export const feedStatus = {
  deleted: -1,
  pending: 0,
  normal: 1,
  top: 2,
  faved: 3
};

export const orderStatus = {
  pending: {
    status: 0,
    statusText: '待支付'
  },
  paid: {
    status: 1, 
    statusText: '已支付'
  },
  failed: {
    status: 2, 
    statusText: '支付失败'
  },
  withdrew: {
    status: 3, 
    statusText: '已取消'
  },
  closed: {
    status: 4, 
    statusText: '已关闭'
  },
  refunding: {
    status: 5, 
    statusText: '申请退款中'
  },
  refunded: {
    status: 6, 
    statusText: '已退款'
  },
}

export const raceGroups = {
  individual: {
    groupType: 'individual',
    groupText: '个人组'
  },
  relay: {
    groupType: 'relay',
    groupText: '接力组'
  },
  family: {
    groupType: 'family',
    groupText: '家庭组'
  }
}