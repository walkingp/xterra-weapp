const rules = [
  {
    id: 0,
    title: '注册会员',
    point: 100,
    once: true
  },
  {
    id: 1,
    title: '完善资料',
    point: 50,
    once: true
  },
  {
    id: 2,
    title: '报名赛事活动',
    point: 50
  },
  {
    id: 3,
    title: '发表新贴',
    point: 5,
    once: false
  },
  {
    id: 4,
    title: '评论',
    point: 2,
    once: false
  },
  {
    id: 5,
    title: '点赞',
    point: 2,
    once: false
  },
  {
    id: 6,
    title: '打卡',
    point: 2
  },
  {
    id: 7,
    title: '取消点赞',
    point: -2
  },
  {
    id: 99,
    title: '管理员手工添加',
    point: 0,
    once: false
  }
];
const pointRuleEnum = {
  SignUp: 0,
  UpdateProfile: 1,
  SignUpEvent: 2,
  Post: 3,
  Comment: 4,
  Kudos: 5,
  Tick: 6,
  CancelKudos: 7,
  AdminCustom: 99
};

module.exports = { rules, pointRuleEnum} ;