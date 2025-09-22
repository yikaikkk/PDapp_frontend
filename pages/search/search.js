// search.js
Page({
  data: {
    keyword: '',
    activeTab: 'hot', // 'hot' 或 'latest'
    results: {
      hot: [],
      latest: []
    },
    filters: {
      types: [],
      distance: false,
      rating: 0
    },
    loading: false,
    hasMore: true
  },

  onLoad: function(options) {
    if (options.keyword) {
      this.setData({
        keyword: options.keyword
      });
      this.searchLocations();
    }
  },

  onSearchInput: function(e) {
    this.setData({
      keyword: e.detail.value
    });
  },

  onSearch: function() {
    if (!this.data.keyword.trim()) {
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none'
      });
      return;
    }
    this.searchLocations();
  },

  searchLocations: function() {
    this.setData({loading: true});
    // 模拟搜索请求
    setTimeout(() => {
      const mockHotResults = [
        {
          id: 1,
          name: '外滩观景台',
          location: '上海市黄浦区',
          type: 'architecture',
          image: 'https://images.example.com/bund1.jpg',
          favorites: 234,
          checkins: 567,
          distance: '500m'
        },
        {
          id: 2,
          name: '世纪公园日落点',
          location: '上海市浦东新区',
          type: 'nature',
          image: 'https://images.example.com/park1.jpg',
          favorites: 156,
          checkins: 342,
          distance: '1.2km'
        },
        {
          id: 3,
          name: '田子坊文艺角落',
          location: '上海市黄浦区',
          type: 'portrait',
          image: 'https://images.example.com/tianzifang1.jpg',
          favorites: 189,
          checkins: 412,
          distance: '800m'
        }
      ];

      const mockLatestResults = [
        {
          id: 4,
          name: '陆家嘴中心绿地',
          location: '上海市浦东新区',
          type: 'nature',
          image: 'https://images.example.com/lujiazui1.jpg',
          favorites: 78,
          checkins: 123,
          distance: '2.5km'
        },
        {
          id: 5,
          name: '豫园老街夜景',
          location: '上海市黄浦区',
          type: 'night',
          image: 'https://images.example.com/yuyuan1.jpg',
          favorites: 145,
          checkins: 267,
          distance: '1.8km'
        }
      ];

      this.setData({
        'results.hot': mockHotResults,
        'results.latest': mockLatestResults,
        loading: false
      });
    }, 1000);
  },

  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({activeTab: tab});
  },

  showFilters: function() {
    wx.showActionSheet({
      itemList: ['建筑', '自然', '人像', '夜景', '日出日落', '按距离筛选', '评分筛选'],
      success: res => {
        if (res.tapIndex >= 0 && res.tapIndex <= 4) {
          const typeMap = {0: 'architecture', 1: 'nature', 2: 'portrait', 3: 'night', 4: 'sunrise_sunset'};
          const type = typeMap[res.tapIndex];
          const types = this.data.filters.types;
          const index = types.indexOf(type);
          if (index > -1) {
            types.splice(index, 1);
          } else {
            types.push(type);
          }
          this.setData({'filters.types': types});
          this.searchLocations();
        } else if (res.tapIndex === 5) {
          this.setData({'filters.distance': !this.data.filters.distance});
          this.searchLocations();
        } else if (res.tapIndex === 6) {
          this.showRatingFilter();
        }
      }
    });
  },

  showRatingFilter: function() {
    wx.showModal({
      title: '评分筛选',
      content: '请选择最低评分',
      confirmText: '4分及以上',
      cancelText: '3分及以上',
      success: res => {
        if (res.confirm) {
          this.setData({'filters.rating': 4});
        } else if (res.cancel) {
          this.setData({'filters.rating': 3});
        }
        this.searchLocations();
      }
    });
  },

  onItemTap: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  onReachBottom: function() {
    if (this.data.loading || !this.data.hasMore) return;
    this.loadMore();
  },

  loadMore: function() {
    this.setData({loading: true});
    // 模拟加载更多数据
    setTimeout(() => {
      this.setData({loading: false, hasMore: false});
    }, 1000);
  }
})