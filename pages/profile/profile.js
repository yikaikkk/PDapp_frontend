// profile.js
const auth = require('../../utils/auth.js');

Page({
  data: {
    userInfo: {
      avatar: 'https://images.example.com/default_avatar.png',
      nickname: '摄影爱好者',
      bio: '喜欢记录城市的每一个角落和自然风光',
      posts: 28,
      collections: 156,
      followers: 124
    },
    menuItems: [
      {
        id: 'posts',
        title: '我的发布',
        icon: 'edit'
      },
      {
        id: 'collections',
        title: '我的收藏',
        icon: 'star'
      },
      {
        id: 'checkins',
        title: '我的打卡',
        icon: 'camera',
        badge: 2
      },
      {
        id: 'drafts',
        title: '草稿箱',
        icon: 'form'
      },
      {
        id: 'notifications',
        title: '消息通知',
        icon: 'notification',
        badge: 100
      }
    ],
    settingItems: [
      {
        id: 'account',
        title: '账号管理',
        icon: 'user'
      },
      {
        id: 'privacy',
        title: '隐私设置',
        icon: 'lock'
      },
      {
        id: 'feedback',
        title: '意见反馈',
        icon: 'message'
      },
      {
        id: 'about',
        title: '关于我们',
        icon: 'info'
      }
    ],
    draftCount: 0,
    loading: false,
    isLoggedIn: false
  },

  onLoad: function() {
    this.checkLoginStatus();
    this.getDraftCount();
  },
  
  // 页面显示时检查登录状态
  onShow: function() {
    this.checkLoginStatus();
  },

  // 检查登录状态
  checkLoginStatus: function() {
    const isLoggedIn = auth.isLoggedIn();
    this.setData({
      isLoggedIn: isLoggedIn
    });
    
    if (isLoggedIn) {
      this.getUserInfo();
    }
  },

  getUserInfo: function() {
    // 从全局获取用户信息
    const app = getApp();
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      });
    } else {
      // 请求用户授权
      wx.getUserProfile({
        desc: '用于完善个人资料',
        success: (res) => {
          app.globalData.userInfo = Object.assign({}, this.data.userInfo, {
            avatar: res.userInfo.avatarUrl,
            nickname: res.userInfo.nickName
          });
          this.setData({
            userInfo: app.globalData.userInfo
          });
        }
      });
    }
  },

  getDraftCount: function() {
    // 模拟获取草稿数量
    setTimeout(() => {
      this.setData({
        draftCount: 3
      });
    }, 500);
  },

  // 跳转到登录页面
  goToLogin: function() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  onMenuItemTap: function(e) {
    // 检查是否已登录，未登录则跳转到登录页面
    if (!this.data.isLoggedIn) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      setTimeout(() => {
        this.goToLogin();
      }, 1000);
      return;
    }
    
    const id = e.currentTarget.dataset.id;
    switch(id) {
      case 'posts':
        wx.navigateTo({
          url: '/pages/posts/posts'
        });
        break;
      case 'collections':
        wx.navigateTo({
          url: '/pages/collections/collections'
        });
        break;
      case 'checkins':
        wx.navigateTo({
          url: '/pages/checkin/checkin'
        });
        break;
      case 'drafts':
        wx.navigateTo({
          url: '/pages/drafts/drafts'
        });
        break;
      case 'notifications':
        wx.navigateTo({
          url: '/pages/notifications/notifications'
        });
        break;
    }
  },

  onSettingItemTap: function(e) {
    const id = e.currentTarget.dataset.id;
    switch(id) {
      case 'account':
        wx.navigateTo({
          url: '/pages/account/account'
        });
        break;
      case 'privacy':
        wx.navigateTo({
          url: '/pages/privacy/privacy'
        });
        break;
      case 'feedback':
        wx.navigateTo({
          url: '/pages/feedback/feedback'
        });
        break;
      case 'about':
        wx.navigateTo({
          url: '/pages/about/about'
        });
        break;
    }
  },
  
  // 注销登录
  logout: function() {
    wx.showModal({
      title: '确认注销',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          auth.clearToken();
          const app = getApp();
          app.globalData.userInfo = null;
          this.setData({
            isLoggedIn: false,
            userInfo: {
              avatar: 'https://images.example.com/default_avatar.png',
              nickname: '摄影爱好者',
              bio: '喜欢记录城市的每一个角落和自然风光',
              posts: 28,
              collections: 156,
              followers: 124
            }
          });
          wx.showToast({
            title: '注销成功',
            icon: 'success'
          });
        }
      }
    });
  },

  onEditProfile: function() {
    wx.navigateTo({
      url: '/pages/editProfile/editProfile'
    });
  },

  onAvatarTap: function() {
    const that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        const tempFilePath = res.tempFilePaths[0];
        // 上传头像到服务器
        that.uploadAvatar(tempFilePath);
      }
    });
  },

  uploadAvatar: function(filePath) {
    this.setData({loading: true});
    // 模拟上传头像
    setTimeout(() => {
      const app = getApp();
      app.globalData.userInfo.avatar = filePath;
      this.setData({
        'userInfo.avatar': filePath,
        loading: false
      });
      wx.showToast({
        title: '头像更新成功',
        icon: 'success'
      });
    }, 1500);
  },

  onShareAppMessage: function() {
    return {
      title: '我的摄影机位分享',
      path: '/pages/profile/profile'
    };
  }
});