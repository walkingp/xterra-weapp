export const storageKey = {
  userId: 'userId',
  order: 'order'
};

export const raceStatus = [
  { text: '未开始报名', value: '未开始报名', bgColor: '#FCE9E3', textColor: '#EA6D44' },
  { text: '报名中', value: '报名中', bgColor: '#E4F1F0', textColor: '#49A499' },
  { text: '名额已满', value: '名额已满', bgColor: '#F5DBE0', textColor: '#B90B2E' },
  { text: '报名已截止', value: '报名已截止', bgColor: '#EEEDED', textColor: '#999' },
  { text: '比赛已结束', value: '比赛已结束', bgColor: '#EEEDED', textColor: '#999' },
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
    statusText: '待支付',
    textColor: '#DF1042'
  },
  paid: {
    status: 1, 
    statusText: '已支付',
    textColor: '#0b8235'
  },
  failed: {
    status: 2, 
    statusText: '支付失败',
    textColor: '#DF1042'
  },
  withdrew: {
    status: 3, 
    statusText: '已取消',
    textColor: '#DF1042'
  },
  closed: {
    status: 4, 
    statusText: '已关闭',
    textColor: '#eee'
  },
  refunding: {
    status: 5, 
    statusText: '申请退款中',
    textColor: '#DF1042'
  },
  refunded: {
    status: 6, 
    statusText: '已退款',
    textColor: '#DF1042'
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

export const emailTemplateType = {
  registration: {
    title: '报名邮件',
    value: 'registration'
  }
}

export const raceResultStatus = {
  notStart: {
    title: '比赛未开始',
    value: 'notStart'
  },
  racing: {
    title: '比赛中',
    value: 'racing'
  },
  DNS: {
    title: 'DNS',
    value: 'DNS'
  },
  DSQ: {
    title: 'DSQ',
    value: 'DSQ'
  },
  DNF: {
    title: 'DNF',
    value: 'DNF'
  },
  done: {
    title: '已完赛',
    value: 'done'
  },
  lapped: {
    title: '被套圈',
    value: 'lapped'
  },
  penalty: {
    title: '罚时',
    value: 'penalty'
  },
  norecord: {
    title: '无成绩记录',
    value: 'norecord'
  }
}
export const pointRuleEnum = {
  SignUp: 0,
  UpdateProfile: 1,
  AdminCustom: 99
};
// 注意cloudfunctions也需要同步更新
export const pointRules = [
  {
    id: 0,
    title: '注册会员',
    point: 100
  },
  {
    id: 1,
    title: '完善资料',
    point: 50
  },
  {
    id: 2,
    title: '报名赛事活动',
    point: 50
  },
  {
    id: 3,
    title: '发贴',
    point: 5
  },
  {
    id: 4,
    title: '点赞或评论',
    point: 2
  },
  {
    id: 5,
    title: '打卡',
    point: 2
  },
  {
    id: 99,
    title: '管理员手工添加',
    point: 10,
    once: false
  }
]