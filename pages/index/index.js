// pages/index/index.js
const request = require('../../utils/request.js');

Page({
  data: {
    searchKeyword: '',
    filters: {
      distance: false,
      popularity: true,
      type: []
    },
    categories: [
      {id: 'all', name: '全部'},
      {id: 'architecture', name: '建筑'},
      {id: 'nature', name: '自然'},
      {id: 'portrait', name: '人像'},
      {id: 'street', name: '街头'},
      {id: 'night', name: '夜景'}
    ],
    activeCategory: 'all',
    locations: [], // 初始为空数组，通过接口获取数据
    currentLocation: {latitude: 31.2304, longitude: 121.4737},
    isLoadingMore: false,
    hasMore: true,
    currentPage: 1,
    pageSize: 10,
    searchParams: {
      page: 1,
      size: 10,
      address: '',
      title: '',
      type: ''
    }
  },

  onLoad: function() {
    // 获取用户位置
    this.getUserLocation();
    // 加载文章列表
    this.loadArticles();
  },
  
  // 加载文章列表
  loadArticles: function(isLoadMore = false) {
    const { searchParams, currentPage, pageSize } = this.data;
    
    // 显示加载提示
    wx.showLoading({
      title: isLoadMore ? '加载更多...' : '加载中...',
    });
    
    // 设置请求参数
    const params = {
      ...searchParams,
      page: isLoadMore ? currentPage + 1 : 1,
      size: pageSize
    };
    
    // 调用分页查询接口 (使用POST请求)
    request.post('/api/articles/page', params)
      .then(res => {
        wx.hideLoading();
        
        // 检查数据结构，适配后端返回格式（注意：request.js已直接返回res.data）
        console.log('分页查询返回数据:', res);
        
        if (res && Array.isArray(res.records)) {
          const articles = res.records;
          console.log('找到文章数量:', articles.length);
          
          // 格式化返回的数据，适配前端展示
          const formattedArticles = articles.map(article => {
            // 将后端返回的accessUrls转换为images格式，并清理URL中的无效字符
            const images = (article.accessUrls || []).map(url => {
              // 清理URL中的反引号、空格等无效字符
              if (typeof url === 'string') {
                return url.replace(/[`\s]/g, '');
              }
              return url;
            });
            
            // 格式化创建时间，处理createTime为null的情况
            const now = new Date();
            const createTime = article.createTime ? new Date(article.createTime) : now;
            const diffInMinutes = Math.floor((now - createTime) / (1000 * 60));
            
            let formattedTime;
            if (diffInMinutes < 60) {
              formattedTime = `${diffInMinutes}分钟前`;
            } else if (diffInMinutes < 1440) {
              formattedTime = `${Math.floor(diffInMinutes / 60)}小时前`;
            } else {
              formattedTime = `${Math.floor(diffInMinutes / 1440)}天前`;
            }
            
            return {
              ...article,
              position: { latitude: article.latitude, longitude: article.longitude },
              images: images,
              distance: this.calculateDistance(article.latitude, article.longitude),
              formattedTime,
              // 模拟数据，实际应该从后端获取
              favorites: Math.floor(Math.random() * 500),
              checkins: Math.floor(Math.random() * 1000),
              likes: Math.floor(Math.random() * 2000),
              comments: Math.floor(Math.random() * 300),
              author: {
                avatar: `https://images.example.com/user${Math.floor(Math.random() * 10)}.jpg`,
                nickname: `用户${article.authorId || Math.floor(Math.random() * 1000)}`
              },
              tags: [article.type, article.address ? article.address.split(' ')[0] : '摄影']
            };
          });
          
          // 判断是否还有更多数据
          const hasMore = formattedArticles.length === pageSize;
          
          // 更新数据
          this.setData({
            locations: isLoadMore ? [...this.data.locations, ...formattedArticles] : formattedArticles,
            hasMore,
            currentPage: isLoadMore ? currentPage + 1 : 1,
            isLoadingMore: false
          });
        } else {
          wx.showToast({
            title: '获取数据失败',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        wx.hideLoading();
        console.error('加载文章失败:', err);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      });
  },
  
  // 计算距离（模拟）
  calculateDistance: function(latitude, longitude) {
    const { currentLocation } = this.data;
    // 简单模拟距离计算
    const latDiff = Math.abs(latitude - currentLocation.latitude);
    const lngDiff = Math.abs(longitude - currentLocation.longitude);
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 10000;
    
    if (distance < 1) {
      return '<1km';
    } else if (distance < 5) {
      return `${Math.floor(distance)}km`;
    } else {
      return '5km+';
    }
  },

  getUserLocation: function() {
    const that = this;
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        that.setData({
          currentLocation: {latitude: res.latitude, longitude: res.longitude}
        });
      },
      fail: function() {
        wx.showToast({
          title: '获取位置信息失败',
          icon: 'none'
        });
      }
    });
  },



  onSearch: function(e) {
    const keyword = e.detail.value;
    this.setData({ searchKeyword: keyword });
    // 这里可以添加搜索逻辑
    this.searchLocations(keyword);
  },

  searchLocations: function(keyword) {
    // 更新搜索参数
    const searchParams = {
      ...this.data.searchParams,
      title: keyword || '',
      page: 1
    };
    
    this.setData({
      searchParams,
      currentPage: 1
    });
    
    // 重新加载数据
    this.loadArticles();
    
    if (!keyword) {
      wx.showToast({
        title: '搜索已清空',
        icon: 'none'
      });
    }
  },

  onFilter: function() {
    // 打开筛选弹窗逻辑
    wx.showModal({
      title: '筛选',
      content: '这里将打开筛选选项',
      showCancel: true,
      success: (res) => {
        if (res.confirm) {
          // 实现筛选逻辑
        }
      }
    });
  },

  switchCategory: function(e) {
    const categoryId = e.currentTarget.dataset.id;
    this.setData({ activeCategory: categoryId });
    // 根据分类筛选内容
    this.filterByCategory(categoryId);
  },

  filterByCategory: function(categoryId) {
    // 更新搜索参数
    const searchParams = {
      ...this.data.searchParams,
      type: categoryId === 'all' ? '' : categoryId,
      page: 1
    };
    
    this.setData({
      searchParams,
      currentPage: 1
    });
    
    // 重新加载数据
    this.loadArticles();
  },

  onLocationClick: function(e) {
    const locationId = e.currentTarget.dataset.id;
    // 跳转到详情页
    wx.navigateTo({
      url: `/pages/detail/detail?id=${locationId}`
    });
  },

  onUserClick: function(e) {
    const userId = e.currentTarget.dataset.userId;
    // 跳转到用户主页
    wx.navigateTo({
      url: `/pages/profile/profile?userId=${userId}`
    });
  },

  onLike: function(e) {
    const id = e.currentTarget.dataset.id;
    const locations = this.data.locations.map(item => {
      if (item.id === id) {
        return {
          ...item,
          likes: item.likes + 1
        };
      }
      return item;
    });
    
    this.setData({ locations });
    wx.showToast({
      title: '点赞成功',
      icon: 'success',
      duration: 1500
    });
  },

  onFavorite: function(e) {
    const id = e.currentTarget.dataset.id;
    const locations = this.data.locations.map(item => {
      if (item.id === id) {
        return {
          ...item,
          favorites: item.favorites + 1
        };
      }
      return item;
    });
    
    this.setData({ locations });
    wx.showToast({
      title: '收藏成功',
      icon: 'success',
      duration: 1500
    });
  },

  onComment: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}&showComment=1`
    });
  },

  onPublish: function() {
    wx.navigateTo({
      url: '/pages/publish/publish'
    });
  },

  loadMore: function() {
    if (this.data.isLoadingMore || !this.data.hasMore) {
      return;
    }
    
    this.loadArticles(true);
  }
});