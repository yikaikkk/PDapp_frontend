// checkin.js
Page({
  data: {
    checkinRecords: [],
    loading: false,
    hasMore: true
  },

  onLoad: function() {
    this.loadCheckinRecords();
  },

  loadCheckinRecords: function() {
    this.setData({loading: true});
    // 模拟获取打卡记录数据
    setTimeout(() => {
      const mockRecords = [
        {
          id: 1,
          locationId: 1,
          locationName: '外滩观景台',
          checkinTime: '2023-10-15',
          userImages: ['https://images.example.com/user_checkin1.jpg', 'https://images.example.com/user_checkin2.jpg'],
          locationImages: ['https://images.example.com/bund1.jpg'],
          comments: '今天的日落太美了，这个机位果然名不虚传！',
          likes: 35,
          isLiked: false
        },
        {
          id: 2,
          locationId: 2,
          locationName: '世纪公园日落点',
          checkinTime: '2023-10-10',
          userImages: ['https://images.example.com/user_checkin3.jpg'],
          locationImages: ['https://images.example.com/park1.jpg'],
          comments: '秋天的公园色彩斑斓，非常适合拍照',
          likes: 24,
          isLiked: true
        },
        {
          id: 3,
          locationId: 3,
          locationName: '田子坊文艺角落',
          checkinTime: '2023-09-28',
          userImages: ['https://images.example.com/user_checkin4.jpg', 'https://images.example.com/user_checkin5.jpg', 'https://images.example.com/user_checkin6.jpg'],
          locationImages: ['https://images.example.com/tianzifang1.jpg'],
          comments: '和朋友一起来拍照，记录美好时光',
          likes: 18,
          isLiked: false
        }
      ];
      this.setData({
        checkinRecords: mockRecords,
        loading: false
      });
    }, 1000);
  },

  onLocationTap: function(e) {
    const locationId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${locationId}`
    });
  },

  toggleLike: function(e) {
    const recordId = e.currentTarget.dataset.id;
    const records = this.data.checkinRecords;
    const index = records.findIndex(item => item.id === recordId);
    if (index > -1) {
      const isLiked = records[index].isLiked;
      records[index].isLiked = !isLiked;
      records[index].likes = isLiked ? records[index].likes - 1 : records[index].likes + 1;
      this.setData({
        checkinRecords: records
      });
    }
  },

  previewImage: function(e) {
    const index = e.currentTarget.dataset.index;
    const recordIndex = e.currentTarget.dataset.recordIndex;
    const images = this.data.checkinRecords[recordIndex].userImages;
    wx.previewImage({
      current: images[index],
      urls: images
    });
  },

  compareWithOriginal: function(e) {
    const recordIndex = e.currentTarget.dataset.index;
    const record = this.data.checkinRecords[recordIndex];
    wx.navigateTo({
      url: `/pages/compare/compare?locationId=${record.locationId}&checkinId=${record.id}`
    });
  },

  onReachBottom: function() {
    if (this.data.loading || !this.data.hasMore) return;
    this.loadMoreRecords();
  },

  loadMoreRecords: function() {
    this.setData({loading: true});
    // 模拟加载更多数据
    setTimeout(() => {
      this.setData({loading: false, hasMore: false});
    }, 1000);
  }
})