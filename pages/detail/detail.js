// detail.js
Page({
  data: {
    locationId: '',
    locationDetail: null,
    currentImageIndex: 0,
    comments: [],
    newComment: '',
    isLiked: false,
    likeCount: 0,
    weatherInfo: null
  },

  onLoad: function(options) {
    this.setData({
      locationId: options.id
    });
    this.getLocationDetail();
    this.getComments();
    this.getWeatherInfo();
  },

  getLocationDetail: function() {
    // 模拟获取机位详情数据
    const mockData = {
      id: 1,
      name: '外滩观景台',
      position: {latitude: 31.2397, longitude: 121.4993},
      address: '上海市黄浦区中山东一路',
      type: 'architecture',
      images: [
        'https://images.example.com/bund1.jpg',
        'https://images.example.com/bund2.jpg',
        'https://images.example.com/bund3.jpg',
        'https://images.example.com/bund4.jpg'
      ],
      description: '这里是拍摄上海陆家嘴三件套（上海中心大厦、环球金融中心和金茂大厦）的最佳视角之一。位于外滩观景台，视野开阔，没有遮挡。',
      arrivalMethod: '乘坐地铁2号线到南京东路站，步行约10分钟即可到达。',
      shootingTips: '1. 最佳拍摄时间：日落前30分钟至日落后30分钟，此时天空呈现蓝调，与城市灯光形成鲜明对比。\n2. 推荐使用广角镜头（16-35mm）拍摄全景。\n3. 使用三脚架和ND滤镜可以拍摄慢门效果，捕捉车流轨迹。',
      notes: '1. 周末和节假日人流量较大，建议提前到达占据有利位置。\n2. 注意保管好个人财物，人多手杂。\n3. 冬季拍摄注意保暖。',
      deviceInfo: 'iPhone 13 Pro, 16mm广角镜头',
      tags: ['城市风光', '新手友好', '免费机位', '夜景', '日出日落'],
      favorites: 234,
      checkins: 567,
      isFavorite: false,
      author: {
        avatar: 'https://images.example.com/user1.jpg',
        nickname: '摄影爱好者',
        id: 1001
      }
    };
    this.setData({
      locationDetail: mockData,
      isLiked: mockData.isFavorite,
      likeCount: mockData.favorites
    });
  },

  getComments: function() {
    // 模拟获取评论数据
    const mockComments = [
      {
        id: 1,
        userId: 1002,
        avatar: 'https://images.example.com/user2.jpg',
        nickname: '城市摄影师',
        content: '果然是个好机位，昨天去拍了，效果非常棒！推荐大家日落时分去。',
        images: ['https://images.example.com/user_photo1.jpg'],
        time: '2小时前',
        likes: 15
      },
      {
        id: 2,
        userId: 1003,
        avatar: 'https://images.example.com/user3.jpg',
        nickname: '周末摄影',
        content: '请问用什么镜头拍最合适？我只有一个套机镜头。',
        images: [],
        time: '昨天',
        likes: 3,
        reply: {
          userId: 1001,
          nickname: '摄影爱好者',
          content: '套机镜头也可以，尽量用广角端拍摄，退后一些可以拍到更全的景色。'
        }
      }
    ];
    this.setData({comments: mockComments});
  },

  getWeatherInfo: function() {
    // 模拟获取天气信息
    const mockWeather = {
      location: '上海',
      forecast: [
        {
          date: '今天',
          weather: '晴',
          temp: '18°-25°',
          bestTime: '17:30-18:30',
          suitable: true
        },
        {
          date: '明天',
          weather: '多云',
          temp: '16°-22°',
          bestTime: '17:20-18:20',
          suitable: true
        },
        {
          date: '后天',
          weather: '小雨',
          temp: '14°-19°',
          bestTime: '',
          suitable: false
        }
      ]
    };
    this.setData({weatherInfo: mockWeather});
  },

  onImageTap: function(e) {
    // 点击图片预览
    const index = e.currentTarget.dataset.index;
    const images = this.data.locationDetail.images;
    wx.previewImage({
      current: images[index],
      urls: images
    });
  },

  onImageChanged: function(e) {
    this.setData({
      currentImageIndex: e.detail.current
    });
  },

  toggleFavorite: function() {
    const isLiked = this.data.isLiked;
    this.setData({
      isLiked: !isLiked,
      likeCount: isLiked ? this.data.likeCount - 1 : this.data.likeCount + 1
    });
    // 实际项目中这里应该调用收藏/取消收藏API
  },

  shareLocation: function() {
    // 分享功能
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  navigateToLocation: function() {
    // 导航到机位
    const position = this.data.locationDetail.position;
    wx.openLocation({
      latitude: position.latitude,
      longitude: position.longitude,
      name: this.data.locationDetail.name,
      address: this.data.locationDetail.address,
      scale: 18
    });
  },

  reportLocation: function() {
    // 举报功能
    wx.showModal({
      title: '举报',
      content: '请选择举报原因',
      showCancel: true,
      cancelText: '取消',
      confirmText: '提交',
      success: res => {
        if (res.confirm) {
          wx.showToast({
            title: '举报已提交',
            icon: 'success'
          });
        }
      }
    });
  },

  submitComment: function() {
    if (!this.data.newComment.trim()) {
      wx.showToast({
        title: '评论内容不能为空',
        icon: 'none'
      });
      return;
    }
    // 模拟提交评论
    const newComment = {
      id: Date.now(),
      userId: 1004,
      avatar: 'https://images.example.com/current_user.jpg',
      nickname: '当前用户',
      content: this.data.newComment,
      images: [],
      time: '刚刚',
      likes: 0
    };
    const comments = [newComment, ...this.data.comments];
    this.setData({
      comments: comments,
      newComment: ''
    });
    wx.showToast({
      title: '评论成功',
      icon: 'success'
    });
  },

  onCommentInput: function(e) {
    this.setData({
      newComment: e.detail.value
    });
  },

  iAlsoShot: function() {
    // 跳转到发布页，自动关联此机位
    wx.navigateTo({
      url: `/pages/publish/publish?locationId=${this.data.locationId}&locationName=${this.data.locationDetail.name}`
    });
  }
})