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
    id: 99,
    title: '管理员手工添加',
    point: 0,
    once: false
  }
];
const pointRuleEnum = {
  SignUp: 0,
  UpdateProfile: 1,
  AdminCustom: 99
};

module.exports = { rules, pointRuleEnum} ;