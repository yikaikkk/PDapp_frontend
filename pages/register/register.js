// 注册页面逻辑
const auth = require('../../utils/auth.js');

Page({
  data: {
    username: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    email: '',
    phone: '',
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

  // 监听确认密码输入
  onConfirmPasswordInput(e) {
    this.setData({
      confirmPassword: e.detail.value,
      errorMsg: ''
    });
  },

  // 监听昵称输入
  onNicknameInput(e) {
    this.setData({
      nickname: e.detail.value,
      errorMsg: ''
    });
  },

  // 监听邮箱输入
  onEmailInput(e) {
    this.setData({
      email: e.detail.value,
      errorMsg: ''
    });
  },

  // 监听手机号输入
  onPhoneInput(e) {
    this.setData({
      phone: e.detail.value,
      errorMsg: ''
    });
  },

  // 表单验证
  validateForm() {
    const { username, password, confirmPassword, nickname } = this.data;
    
    if (!username.trim()) {
      this.setData({ errorMsg: '请设置用户名' });
      return false;
    }
    
    if (username.length < 3 || username.length > 20) {
      this.setData({ errorMsg: '用户名长度应为3-20位' });
      return false;
    }
    
    if (!password.trim()) {
      this.setData({ errorMsg: '请设置密码' });
      return false;
    }
    
    if (password.length < 6 || password.length > 20) {
      this.setData({ errorMsg: '密码长度应为6-20位' });
      return false;
    }
    
    if (password !== confirmPassword) {
      this.setData({ errorMsg: '两次输入的密码不一致' });
      return false;
    }
    
    if (!nickname.trim()) {
      this.setData({ errorMsg: '请设置昵称' });
      return false;
    }
    
    if (nickname.length > 20) {
      this.setData({ errorMsg: '昵称长度不能超过20位' });
      return false;
    }
    
    // 邮箱格式验证（如果填写了邮箱）
    const email = this.data.email.trim();
    if (email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      this.setData({ errorMsg: '请输入有效的邮箱地址' });
      return false;
    }
    
    // 手机号格式验证（如果填写了手机号）
    const phone = this.data.phone.trim();
    if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
      this.setData({ errorMsg: '请输入有效的手机号' });
      return false;
    }
    
    return true;
  },

  // 注册
  register() {
    if (!this.validateForm()) {
      return;
    }
    
    const { username, password, nickname, email, phone } = this.data;
    
    // 显示加载状态
    this.setData({ loading: true });
    
    // 调用注册API
    auth.register({
      username,
      password,
      nickname,
      email: email || undefined,
      phone: phone || undefined
    }).then(res => {
      // 注册成功，显示提示
      wx.showToast({
        title: '注册成功',
        icon: 'success',
        duration: 1500
      });
      
      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login'
        });
      }, 1500);
    }).catch(err => {
      // 注册失败
      console.error('注册失败', err);
      this.setData({
        errorMsg: err.message || '注册失败，请稍后再试',
        loading: false
      });
    });
  },

  // 跳转到登录页面
  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
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