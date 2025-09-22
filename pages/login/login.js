// 登录页面逻辑
const auth = require('../../utils/auth.js');

Page({
  data: {
    username: '',
    password: '',
    loading: false,
    errorMsg: ''
  },

  // 监听用户名输入
  onUsernameInput(e) {
    this.setData({
      username: e.detail.value,
      errorMsg: ''
    });
  },

  // 监听密码输入
  onPasswordInput(e) {
    this.setData({
      password: e.detail.value,
      errorMsg: ''
    });
  },

  // 登录
  login() {
    const { username, password } = this.data;
    
    // 简单的表单验证
    if (!username.trim()) {
      this.setData({ errorMsg: '请输入用户名' });
      return;
    }
    
    if (!password.trim()) {
      this.setData({ errorMsg: '请输入密码' });
      return;
    }
    
    // 显示加载状态
    this.setData({ loading: true });
    
    // 调用登录API
    auth.login({
      username,
      password
    }).then(res => {
      // 登录成功，保存token
      auth.saveToken(res.token);
      
      // 设置用户信息到全局变量
      const app = getApp();
      if (res.userInfo) {
        app.globalData.userInfo = res.userInfo;
      }
      
      // 显示成功提示
      wx.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 1500
      });
      
      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/profile/profile'  // 登录成功后直接跳转到个人中心
        });
      }, 1500);
    }).catch(err => {
      // 登录失败
      console.error('登录失败', err);
      this.setData({
        errorMsg: err.message || '登录失败，请检查用户名和密码是否正确',
        loading: false
      });
    });
  },

  // 跳转到注册页面
  goToRegister() {
    wx.navigateTo({
      url: '/pages/register/register'
    });
  },

  // 页面加载时检查是否已登录
  onLoad() {
    if (auth.isLoggedIn()) {
      wx.switchTab({
        url: '/pages/index/index'
      });
    }
  }
});