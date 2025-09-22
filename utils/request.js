// 封装wx.request，处理请求拦截和响应拦截
const app = getApp();

const request = {
  // GET请求
  get(url, data = {}) {
    return this.request('GET', url, data);
  },
  
  // POST请求
  post(url, data = {}) {
    return this.request('POST', url, data);
  },
  
  // 上传文件（MultipartFile格式）
  uploadFile(url, filePath, name = 'file') {
    return new Promise((resolve, reject) => {
      // 获取token
      const token = wx.getStorageSync('token') || app.globalData.token;
      
      // 打印请求信息，便于调试
      console.log('上传文件请求:', {
        url: `${app.globalData.baseUrl}${url}`,
        filePath: filePath,
        name: name
      });
      
      wx.uploadFile({
        url: `${app.globalData.baseUrl}${url}`,
        filePath: filePath,
        name: name,
        header: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'multipart/form-data' // 确保正确设置Content-Type
        },
        success: (res) => {
          // 打印响应信息，便于调试
          console.log('上传文件响应状态:', res.statusCode);
          console.log('上传文件原始响应:', res.data);
          
          // 解析响应数据
          let data = res.data;
          try {
            data = JSON.parse(data);
            console.log('解析后的响应数据:', data);
          } catch (e) {
            console.error('解析响应失败:', e);
          }
          
          if (res.statusCode === 401) {
            // 未授权，跳转到登录页
            wx.removeStorageSync('token');
            app.globalData.token = '';
            wx.navigateTo({
              url: '/pages/login/login'
            });
            reject(new Error('未授权，请重新登录'));
          } else if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else if (res.statusCode === 405) {
            // 方法不支持错误，可能是接口路径问题
            console.error('请求方法不支持，可能是接口路径错误');
            reject(new Error('图片上传失败：服务器不支持此请求方法，请检查接口路径'));
          } else {
            wx.showToast({
              title: data.message || '文件上传失败',
              icon: 'none'
            });
            reject(new Error(data.message || `文件上传失败：${res.statusCode}`));
          }
        },
        fail: (err) => {
          console.error('上传文件网络失败:', err);
          wx.showToast({
            title: '网络错误，文件上传失败',
            icon: 'none'
          });
          reject(err);
        }
      });
    });
  },
  
  // 统一请求方法
  request(method, url, data) {
    return new Promise((resolve, reject) => {
      // 请求拦截器
      const token = wx.getStorageSync('token') || app.globalData.token;
      
      wx.request({
        url: `${app.globalData.baseUrl}${url}`,
        method,
        data,
        header: {
          'content-type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        success: (res) => {
          // 响应拦截器
          if (res.statusCode === 401) {
            // 未授权，跳转到登录页
            wx.removeStorageSync('token');
            app.globalData.token = '';
            wx.navigateTo({
              url: '/pages/login/login'
            });
            reject(new Error('未授权，请重新登录'));
          } else if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else {
            wx.showToast({
              title: res.data.message || '请求失败',
              icon: 'none'
            });
            reject(new Error(res.data.message || `请求失败：${res.statusCode}`));
          }
        },
        fail: (err) => {
          wx.showToast({
            title: '网络错误，请稍后再试',
            icon: 'none'
          });
          reject(err);
        }
      });
    });
  }
};

module.exports = request;