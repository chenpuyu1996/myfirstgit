const app = getApp()

var interval //定时器
var intervalRun = false //定时器关
var second = 3 //倒计时秒数，默认3秒

Page({
  // 页面的初始数据
  data: {
    logo: '/images/logo.jpg',
    title: '',
    company: '',
    copyright: '',
    site: '',
    jumpSecond: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: '太奇管理类联考'
    })
    // coypright year
    var fullYear = new Date().getFullYear();
    this.setData({
      title: app.globalData.shareTitle,
      company: app.globalData.company,
      site: app.globalData.site,
      copyright: "Copyright © 2001-" + fullYear,
    })
    this.getentrance() //获取页面来源参数
  },
  /**
   * 获取页面来源参数
   */
  getentrance: function() {
    //获取页面来源参数
    var entrance = wx.getLaunchOptionsSync()
    console.log(entrance)
    //判断本地缓存是否存在entrance
    if (entrance.query.projectId) {
      //获取到的entrance不为空则更新缓存
      //console.log(entrance.query.projectId?true:false)
      wx.setStorageSync('entrance', entrance)
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    intervalRun = true //定时器开
    // second = 2 //倒计时秒数，按需修改
    this.funCheckLogin() // 用户登录检测
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    //清除定时器
    if (intervalRun) {
      intervalRun = false //定时器关
      clearInterval(interval); //清除定时器
    }
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
  // 用户登录检测
  funCheckLogin: function() {
    var _this = this

    try {
      var userInfo = wx.getStorageSync('userInfo') //读取用户本地信息
      // console.log(userInfo)
      if (userInfo) {
        // 重新同步更新一次用户信息

        //在当前页面显示导航条加载动画
        wx.showNavigationBarLoading();
        // 异步重新获取一次用户数据，POST方法
        wx.request({
          url: app.globalData.apiUrl + 'User/getUserInfo', //URL，按实际修改
          method: "POST",
          data: {
            usrid: userInfo.usrid, //用户ID
            token: userInfo.token, //用户验证token，本例为上次登录时间(毫秒)
          },
          success: function(res) {
            console.log(res.data)
            /**
             * 说明：
             * 限制用户惟一登录，如果上次登录时间未变，则接口重写并返回最新登录时间
             */
            if (res.data.code == 0) {
              userInfo = res.data.userInfo
            } else {
              //用户自动异步登录失败
              console.log(res.data.msg + ', CODE:' + res.data.code)
            }

            //更新本地存储用户信息
            try {
              wx.setStorageSync('userInfo', userInfo)
            } catch (e) {}

            //更新全局共享数据
            app.globalData.userInfo = userInfo

          },
          complete: function(res) {
            wx.hideNavigationBarLoading() //隐藏导航条加载动画
          }
        })

      } else {
        second = 1 //倒计时秒数，无本地存储信息1秒跳转
      }
    } catch (e) {}

    // 倒计时
    interval = setInterval(function() {
      _this.setData({
        jumpSecond: second + '秒跳过',
      });
      second--;
      if (second <= 0) {
        intervalRun = false //定时器关
        clearInterval(interval); //清除定时器

        // 延时跳转至主页
        wx.redirectTo({
          url: '/pages/index/index',
        })

      }
    }.bind(this), 1000);

  }

})