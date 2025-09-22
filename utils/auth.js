// 处理登录和注册相关API
const request = require('./request.js');

const auth = {
  // 登录API
  login(data) {
    return request.post('/api/auth/login', data);
  },
  
  // 注册API
  register(data) {
    return request.post('/api/auth/register', data);
  },
  
  // 保存token到本地和全局
  saveToken(token) {
    try {
      wx.setStorageSync('token', token);
      const app = getApp();
      app.globalData.token = token;
    } catch (e) {
      console.error('保存token失败', e);
    }
  },
  
  // 获取token
  getToken() {
    return wx.getStorageSync('token') || '';
  },
  
  // 清除token
  clearToken() {
    try {
      wx.removeStorageSync('token');
      const app = getApp();
      app.globalData.token = '';
    } catch (e) {
      console.error('清除token失败', e);
    }
  },
  
  // 检查是否已登录
  isLoggedIn() {
    const token = this.getToken();
    return !!token;
  }
};

module.exports = auth;