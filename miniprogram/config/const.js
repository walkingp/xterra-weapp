export const storageKey = {
  userId: 'userId',
  order: 'order'
};

export const feedStatus = {
  deleted: -1,
  pending: 0,
  normal: 1,
  top: 2,
  faved: 3
};

export const orderStatus = {
  pending: 0, // 待支付
  paid: 1, // 已支付
  failed: 2, // 支付失败
  withdraw: 3, // 已取消
  closed: 4, // 关闭
  refunding: 5, // 申请退款中
  refunded: 6, // 已退款
}