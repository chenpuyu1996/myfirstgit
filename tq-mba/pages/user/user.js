//获取应用实例
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    isLogin: false, //用户是否已登录，控制布局
    uname: '', //登录用户名
    upass: '', //登录密码
    code: '', //微信小程序的code值
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: '我'
    })

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 如果要做从其它页面返回后，重载页面内容，需将数据加载功能从onload移至此处
    // 登录检测
    if (app.globalData.userInfo && parseInt(app.globalData.userInfo.id) > 0) {
      this.setData({
        isLogin: true
      })
      // 加载数据
      this.funLoadData()
    }
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: app.globalData.shareTitle,
      path: app.globalData.sharePath
    }
  },
  /**
   * 加载用户数据
   */
  funLoadData: function() {
    var _this = this
    var token = wx.getStorageSync('token')
    console.log(token)

    wx.showNavigationBarLoading(); //在当前页面显示导航条加载动画
    wx.request({
      url: app.globalData.apiUrl_two + 'wxmp/user/info/query?datatype=json',
      method: "GET",
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'UserToken': token
      },
      success: function(res) {
        console.log(res.data)

        if (res.data.success) {
          _this.setData({
            userInfo: res.data.data
          })

          //更新本地存储用户信息
          try {
            wx.setStorageSync('userInfo', res.data.data)
            wx.setStorageSync('token', res.data.data.upass)

          } catch (e) {}

          //更新全局共享数据
          app.globalData.userInfo = res.data.data

        } else {
          if (res.data.code == 100001) {
            wx.showModal({
              title: '提示',
              content: '登陆失效请重新登陆',
              success(res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                  //清除缓存和全局变量
                  app.globalData.userInfo = null
                  wx.clearStorageSync()
                  //提示登陆失效跳转到登陆页面
                  wx.redirectTo({
                    url: '/pages/user/user',
                  })
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }
            })
          } else {
            //操作失败
            wx.showToast({
              title: '操作失败！' + res.data.message,
              icon: 'none',
              duration: 4000
            })
          }
        }
      },
      complete: function(res) {
        wx.hideNavigationBarLoading() //隐藏导航条加载动画
      }
    })
  },
  /**
   * 全安退出事件
   */
  bindCeckout: function() {
    wx.showModal({
      title: '温馨提示',
      content: '确定要退出登录状态吗？',
      success: function(res) {
        if (res.confirm) {
          app.globalData.userInfo = null
          wx.clearStorageSync()

          // 关闭所有页面，打开到应用内的某个页面
          wx.reLaunch({
            url: '/pages/index/index'
          })
        }
      }
    })
  },
  /**
   * 用户名输入事件
   */
  bindUnameInput: function(e) {
    this.setData({
      uname: e.detail.value.trim()
    })
  },
  /**
   * 密码输入事件
   */
  bindUpassInput: function(e) {
    this.setData({
      upass: e.detail.value.trim()
    })
  },
  /**
   * 登录提交事件方法
   */
  bindFormSubmit: function(e) {
    var _this = this
    if (!!_this.data.uname.length && !!_this.data.upass.length) {
      //显示 loading 提示框
      wx.showLoading({
        title: '登录中，请稍候...',
        mask: true
      })
      //获取微信小程序的code值
      wx.login({
        success: function(res) {
          console.log(res.code)
          _this.setData({
            code: res.code
          })
          console.log(_this.data.code)
          _this.login()
        }
      })
    }
  },
  /**
   * 执行登陆时的方法
   */
  login: function() {
    var _this = this
    //执行登录操作
    wx.request({
      url: app.globalData.apiUrl_two + 'wxmp/user/login?datatype=json',
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      data: {
        uname: _this.data.uname,
        upass: _this.data.upass,
        code: _this.data.code,
        majorId: app.globalData.projectId,
      },
      success: function(res) {
        console.log(res.data)
        if (res.data.success) {
          //更新本地存储用户信息
          try {
            wx.setStorageSync('userInfo', res.data.data)
            wx.setStorageSync('token', res.data.data.upass)
          } catch (e) {}

          //更新全局共享数据
          app.globalData.userInfo = res.data.data

          // 跳转至主页面
          wx.redirectTo({
            url: '/pages/index/index',
          })
        } else {
          //操作失败
          wx.showToast({
            title: '操作失败！' + res.data.message,
            icon: 'none',
            duration: 4000
          })
        }
      },
      complete: function(res) {
        wx.hideLoading() //隐藏 loading 提示框
      }
    })
  },
  /**
   * 拔打电话
   */
  bindPhoneCall: function() {
    wx.makePhoneCall({
      phoneNumber: '4008887200'
    })
  }

})