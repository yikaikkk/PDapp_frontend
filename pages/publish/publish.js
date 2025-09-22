// publish.js
const request = require('../../utils/request.js');

Page({
  data: {
    images: [],
    maxImages: 9,
    locationName: '',
    currentLocation: {latitude: 0, longitude: 0, address: ''},
    location: '',
    selectedTypes: [],
    // 为每个拍摄类型创建单独的布尔标记，方便WXML中直接使用
    isArchitectureSelected: false,
    isNatureSelected: false,
    isPortraitSelected: false,
    isNightSelected: false,
    isSunriseSunsetSelected: false,
    description: '',
    shootingTips: '',
    notes: '',
    deviceInfo: '',
    tags: [],
    inputTag: '',
    recommendedTags: ['城市风光', '自然风光', '人像', '夜景', '日出日落', '新手友好', '免费机位', '付费机位', '小众机位'],
    isDraft: false,
    locationId: ''
  },

  onLoad: function(options) {
    // 检查是否是从"我也拍过"按钮跳转过来的
    if (options.locationId && options.locationName) {
      this.setData({
        locationId: options.locationId,
        locationName: options.locationName
      });
    }
  },

  getUserLocation: function() {
    const that = this;
    // 先检查用户是否已经授权位置权限
    wx.getSetting({
      success: function(res) {
        // 如果已经授权，直接获取位置
        if (res.authSetting['scope.userLocation']) {
          that.getLocationAndChoose();
        } 
        // 如果用户从未授权过
        else if (res.authSetting['scope.userLocation'] === undefined) {
          wx.showModal({
            title: '位置授权',
            content: '为了帮助您选择精确的拍摄位置，请授权位置权限。我们不会泄露您的位置信息。',
            success: function(modalRes) {
              if (modalRes.confirm) {
                that.getLocationAndChoose();
              }
            }
          });
        } 
        // 如果用户拒绝过授权
        else {
          wx.showModal({
            title: '需要位置权限',
            content: '您已拒绝位置授权，请在设置中打开位置权限以使用此功能。',
            confirmText: '去设置',
            cancelText: '取消',
            success: function(modalRes) {
              if (modalRes.confirm) {
                // 引导用户去设置页面
                wx.openSetting({
                  success: function(settingRes) {
                    if (settingRes.authSetting['scope.userLocation']) {
                      that.getLocationAndChoose();
                    }
                  }
                });
              }
            }
          });
        }
      }
    });
  },

  // 获取位置并选择地点
  getLocationAndChoose: function() {
    const that = this;
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        const latitude = res.latitude;
        const longitude = res.longitude;
        // 调用微信地图API获取地址信息
        wx.chooseLocation({
          latitude: latitude,
          longitude: longitude,
          success: function(locationRes) {
            that.setData({
              currentLocation: {
                latitude: locationRes.latitude,
                longitude: locationRes.longitude,
                address: locationRes.address
              },
              location: locationRes.name
            });
          },
          fail: function(err) {
            console.error('选择位置失败:', err);
            if (err.errMsg && err.errMsg.indexOf('cancel') !== -1) {
              // 用户取消选择位置，不显示提示
              return;
            }
            wx.showToast({
              title: '选择位置失败，请重试',
              icon: 'none'
            });
          }
        });
      },
      fail: function(err) {
        console.error('获取位置信息失败:', err);
        let errorMsg = '获取位置信息失败';
        if (err.errCode) {
          switch(err.errCode) {
            case 1: // PERMISSION_DENIED
              errorMsg = '位置权限已被拒绝，请在设置中开启';
              break;
            case 2: // POSITION_UNAVAILABLE
              errorMsg = '位置信息不可用，请检查设备定位';
              break;
            case 3: // TIMEOUT
              errorMsg = '获取位置超时，请重试';
              break;
            default:
              errorMsg = '获取位置信息失败，请稍后重试';
          }
        }
        wx.showModal({
          title: '提示',
          content: errorMsg,
          confirmText: '重试',
          cancelText: '取消',
          success: function(res) {
            if (res.confirm) {
              that.getLocationAndChoose();
            }
          }
        });
      }
    });
  },

  // 上传图片
  chooseImage: function() {
    if (this.data.images.length >= this.data.maxImages) {
      wx.showToast({
        title: '最多上传9张图片',
        icon: 'none'
      });
      return;
    }
    wx.chooseImage({
      count: this.data.maxImages - this.data.images.length,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        const tempFilePaths = res.tempFilePaths;
        this.setData({
          images: [...this.data.images, ...tempFilePaths]
        });
      }
    });
  },

  // 删除图片
  deleteImage: function(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.images;
    images.splice(index, 1);
    this.setData({
      images: images
    });
  },

  // 预览图片
  previewImage: function(e) {
    const index = e.currentTarget.dataset.index;
    wx.previewImage({
      current: this.data.images[index],
      urls: this.data.images
    });
  },

  // 标记最佳拍摄方向
  markBestDirection: function(e) {
    const index = e.currentTarget.dataset.index;
    wx.showModal({
      title: '提示',
      content: '确定将此图片标记为最佳拍摄方向吗？',
      success: res => {
        if (res.confirm) {
          // 在实际项目中，这里应该更新数据结构来标记最佳方向
          wx.showToast({
            title: '已标记',
            icon: 'success'
          });
        }
      }
    });
  },

  // 选择拍摄类型
  selectType: function(e) {
    console.log('选择前的selectedTypes:', this.data.selectedTypes);
    const type = e.currentTarget.dataset.type;
    console.log('选择的类型:', type);
    // 创建一个全新的数组副本
    const selectedTypes = [...this.data.selectedTypes];
    const index = selectedTypes.indexOf(type);
    
    // 创建更新对象
    const updateData = {};
    
    if (index > -1) {
      console.log('移除类型:', type);
      selectedTypes.splice(index, 1);
      // 设置对应类型的选中状态为false
      updateData['is' + this.capitalizeFirstLetter(type) + 'Selected'] = false;
    } else {
      console.log('添加类型:', type);
      selectedTypes.push(type);
      // 设置对应类型的选中状态为true
      updateData['is' + this.capitalizeFirstLetter(type) + 'Selected'] = true;
    }
    
    // 添加selectedTypes到更新对象
    updateData.selectedTypes = selectedTypes;
    
    console.log('更新数据:', updateData);
    // 更新数据
    this.setData(updateData);
    console.log('更新后的selectedTypes:', this.data.selectedTypes);
  },
  
  // 首字母大写辅助方法
  capitalizeFirstLetter: function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/_([a-z])/g, function(g) {
      return g[1].toUpperCase();
    });
  },

  // 添加标签
  addTag: function() {
    if (!this.data.inputTag.trim()) {
      wx.showToast({
        title: '标签不能为空',
        icon: 'none'
      });
      return;
    }
    if (this.data.tags.length >= 5) {
      wx.showToast({
        title: '最多添加5个标签',
        icon: 'none'
      });
      return;
    }
    if (this.data.tags.includes(this.data.inputTag.trim())) {
      wx.showToast({
        title: '标签已存在',
        icon: 'none'
      });
      return;
    }
    this.setData({
      tags: [...this.data.tags, this.data.inputTag.trim()],
      inputTag: ''
    });
  },

  // 选择推荐标签
  selectRecommendedTag: function(e) {
    const tag = e.currentTarget.dataset.tag;
    if (this.data.tags.length >= 5) {
      wx.showToast({
        title: '最多添加5个标签',
        icon: 'none'
      });
      return;
    }
    if (this.data.tags.includes(tag)) {
      wx.showToast({
        title: '标签已存在',
        icon: 'none'
      });
      return;
    }
    this.setData({
      tags: [...this.data.tags, tag]
    });
  },

  // 删除标签
  deleteTag: function(e) {
    const index = e.currentTarget.dataset.index;
    const tags = this.data.tags;
    tags.splice(index, 1);
    this.setData({
      tags: tags
    });
  },

  // 实时预览
  previewPublish: function() {
    // 检查必填项
    if (!this.data.locationName.trim()) {
      wx.showToast({
        title: '请输入机位名称',
        icon: 'none'
      });
      return;
    }
    if (this.data.images.length === 0) {
      wx.showToast({
        title: '请至少上传一张图片',
        icon: 'none'
      });
      return;
    }
    if (!this.data.location) {
      wx.showToast({
        title: '请选择位置',
        icon: 'none'
      });
      return;
    }
    // 构建预览数据
    const previewData = {
      locationName: this.data.locationName,
      images: this.data.images,
      location: this.data.location,
      selectedTypes: this.data.selectedTypes,
      description: this.data.description,
      arrivalMethod: this.data.arrivalMethod,
      shootingTips: this.data.shootingTips,
      notes: this.data.notes,
      deviceInfo: this.data.deviceInfo,
      tags: this.data.tags
    };
    // 这里应该跳转到预览页面，但为了简化，我们只显示一个提示
    wx.showModal({
      title: '预览成功',
      content: '您的内容已准备好发布',
      showCancel: false
    });
  },

  // 保存草稿
  saveDraft: function() {
    // 保存到本地存储
    const draftData = {
      ...this.data,
      saveTime: new Date().getTime()
    };
    wx.setStorageSync('locationDraft', draftData);
    this.setData({isDraft: true});
    wx.showToast({
      title: '草稿保存成功',
      icon: 'success'
    });
  },

  // 发布机位
  publishLocation: function() {
    // 检查必填项
    if (!this.data.locationName.trim()) {
      wx.showToast({
        title: '请输入机位名称',
        icon: 'none'
      });
      return;
    }
    if (this.data.images.length === 0) {
      wx.showToast({
        title: '请至少上传一张图片',
        icon: 'none'
      });
      return;
    }
    if (!this.data.location) {
      wx.showToast({
        title: '请选择位置',
        icon: 'none'
      });
      return;
    }

    // 显示加载提示
    wx.showLoading({
      title: '上传图片中...',
    });

    // 上传所有图片并获取access_url
    this.uploadImages(this.data.images)
      .then(accessUrls => {
        // 构建符合后端API要求的ArticleVO数据
        const articleData = {
          title: this.data.locationName, // 标题
          name: this.data.location, // 地点名称
          latitude: Number(this.data.currentLocation.latitude), // 纬度
          longitude: Number(this.data.currentLocation.longitude), // 经度
          type: this.data.selectedTypes.join(','), // 拍摄类型，用逗号分隔
          description: this.data.description, // 详细描述
          tips: this.data.shootingTips, // 拍摄技巧
          author_id: wx.getStorageSync('userId') || '', // 作者ID（需要从存储中获取）
          notice: this.data.notes, // 注意事项
          tools: this.data.deviceInfo, // 拍摄工具
          address: this.data.currentLocation.address, // 详细地址
          accessUrl: accessUrls // 上传图片后的access_url列表
        };

        // 更新加载提示
        wx.showLoading({
          title: '发布中...',
        });

        // 调用后端创建文章接口
        return request.post('/api/articles/create', articleData);
      })
      .then(res => {
        wx.hideLoading();
        wx.showModal({
          title: '发布成功',
          content: '您的机位已提交审核，审核通过后将在首页展示',
          showCancel: false,
          success: res => {
            if (res.confirm) {
              // 清除草稿
              wx.removeStorageSync('locationDraft');
              // 返回首页
              wx.navigateBack();
            }
          }
        });
      })
      .catch(err => {
        wx.hideLoading();
        console.error('发布失败:', err);
        wx.showToast({
          title: '发布失败，请稍后重试',
          icon: 'none'
        });
      });
  },

  // 上传图片获取access_url列表
  uploadImages(images) {
    return new Promise((resolve, reject) => {
      const accessUrls = [];
      const uploadPromises = images.map((filePath, index) => {
        return new Promise((innerResolve, innerReject) => {
          // 更新进度提示
          wx.showLoading({
            title: `上传图片 ${index + 1}/${images.length}`,
          });
          
          // 尝试使用不同的接口路径格式
          const uploadPaths = ['/api/articles/images', '/articles/images'];
          let currentPathIndex = 0;
          
          const tryUpload = () => {
            if (currentPathIndex >= uploadPaths.length) {
              innerReject(new Error(`所有接口路径尝试失败: ${uploadPaths.join(', ')}`));
              return;
            }
            
            const currentPath = uploadPaths[currentPathIndex];
            console.log(`尝试上传图片到接口: ${currentPath}`);
            
            request.uploadFile(currentPath, filePath)
              .then(res => {
                console.log(`图片上传到${currentPath}成功:`, res);
                // 从返回的ResultVO对象中获取access_url
                // 后端返回格式: {"success": true, "code": 200, "message": "success", "data": {"access_url": "图片URL"}}
                if (res && res.success && res.data) {
                  // 根据后端返回的ResultVO结构，access_url在data字段中
                  accessUrls.push(res.data.access_url);
                } else if (res && res.data) {
                  // 兼容可能的简化返回格式
                  accessUrls.push(res.data);
                } else {
                  console.error(`图片上传到${currentPath}返回格式异常:`, res);
                  reject(new Error(`第${index + 1}张图片上传返回数据格式异常`));
                }
                
                innerResolve();
              })
              .catch(err => {
                console.error(`第${index + 1}张图片上传到${currentPath}失败:`, err);
                // 如果是POST方法不支持错误，尝试下一个路径
                if (err.message && err.message.includes('不支持此请求方法')) {
                  currentPathIndex++;
                  console.log(`尝试下一个接口路径: ${uploadPaths[currentPathIndex] || '无更多路径'}`);
                  tryUpload();
                } else {
                  reject(err);
                }
              });
          };
          
          // 开始尝试上传
          tryUpload();
          
          // 确保最后隐藏loading
          setTimeout(() => {
            if (index === images.length - 1) {
              wx.hideLoading();
            }
          }, 100);
        });
      });
      
      Promise.all(uploadPromises)
        .then(() => {
          console.log('所有图片上传完成，accessUrls:', accessUrls);
          resolve(accessUrls);
        })
        .catch(err => {
          wx.hideLoading();
          reject(err);
        });
    });
  },

  // 输入框内容变化
  onInputChange: function(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [field]: value
    });
  },

  // 重新选择位置
  reselectLocation: function() {
    this.getUserLocation();
  }
})