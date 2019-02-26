const app = getApp()
var interval //定时器
var intervalRun = false //定时器关
var second = 60 //倒计时秒数，默认60秒

Page({
  /**
   * 页面的初始数据
   */
  data: {
    authcodeLength: 6, //验证码长度
    authcodeText: '点击获取', //获取验证码按钮文字
    allowGetCode: true, //是否允许获取验证码
    phone: '', //手机号码
    authcode: '', //验证码
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
    intervalRun = true //定时器开
    second = 60 //倒计时秒数，按需修改
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
  /**
   * 手机输入事件
   */
  bindPhoneInput: function(e) {
    this.setData({
      phone: e.detail.value.trim()
    })
  },

  /**
   * 验证码输入事件
   */
  bindAuthcodeInput: function(e) {
    this.setData({
      authcode: e.detail.value.trim()
    })
  },

  /**
   * 获取验证码
   */
  bindGetCode: function() {
    var _this = this
    if (_this.data.allowGetCode) {

      _this.setData({
        allowGetCode: false,
        authcodeText: second + '秒 重发',
      });

      // wx.request ……
      // 发送验验码
      wx.showToast({
        title: '验证码已发送，请查收！',
        icon: 'none',
        mask: true,
        duration: 2000
      })


      // 倒计时
      interval = setInterval(function() {
        second--;

        _this.setData({
          authcodeText: second + '秒 重发',
        });

        if (second <= 0) {
          intervalRun = false //定时器关
          clearInterval(interval); //清除定时器

          _this.setData({
            allowGetCode: true,
            authcodeText: '重新发送'
          });

        }
      }.bind(this), 1000);
    }
  },
  /**
   * 登录提交事件方法
   */
  bindFormSubmit: function(e) {
    var _this = this
    if (!!_this.data.phone.length && !!_this.data.authcode.length) {

      //显示 loading 提示框
      wx.showLoading({
        title: '请稍候...',
        mask: true
      })

      //执行登录操作
      wx.request({
        //按实际所需调整api
        url: app.globalData.apiUrl + 'User/findpwd',
        method: "POST",
        data: {
          phone: _this.data.phone,
          authcode: _this.data.authcode
        },
        success: function(res) {
          console.log(res.data)

          wx.hideLoading() //隐藏 loading 提示框
          if (res.data.code == 0) {
            //注册成功
            wx.showToast({
              title: '新密码已发送至手机，请查收！',
              icon: 'none',
              mask: true,
              duration: 2000
            })

            // 延迟
            setTimeout(function() {
              // 返回上一页
              wx.navigateBack({
                delta: 1
              })
            }, 2000)

          } else {
            //操作失败
            wx.showToast({
              title: '操作失败！' + res.data.code,
              icon: 'none',
              duration: 4000
            })
          }
        },
        fail: function() {
          wx.hideLoading() //隐藏 loading 提示框
        },
        complete: function(res) {}
      })
    }
  }
});