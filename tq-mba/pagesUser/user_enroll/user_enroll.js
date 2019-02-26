const app = getApp()
var interval //定时器
var intervalRun = false //定时器关
var second = 60 //倒计时秒数，默认60秒
var phonecode = 0 //手机号码加密编码
var rand //随机数

Page({
  /**
   * 页面的初始数据
   */
  data: {
    authcodeLength: 6, //验证码长度
    authcodeText: '点击获取', //获取验证码按钮文字
    allowGetCode: true, //是否允许获取验证码
    name: '', //用户名
    phone: '', //手机号码
    authcode: '', //验证码
    code: '', //微信小程序的code值
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: '我'
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    intervalRun = true //定时器开
    second = 60 //倒计时秒数，按需修改
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    //清除定时器
    if (intervalRun) {
      intervalRun = false //定时器关
      clearInterval(interval); //清除定时器
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: app.globalData.shareTitle,
      path: app.globalData.sharePath
    }
  },
  /**
   * 用户名输入事件
   */
  bindNameInput: function (e) {
    this.setData({
      name: e.detail.value.trim()
    })
  },

  /**
   * 手机输入事件
   */
  bindPhoneInput: function (e) {
    phonecode = e.detail.value.trim()
    this.setData({
      phone: e.detail.value.trim()
    })
  },

  /**
   * 验证码输入事件
   */
  bindAuthcodeInput: function (e) {
    this.setData({
      authcode: e.detail.value.trim()
    })
  },

  /**
   * 获取验证码
   */
  bindGetCode: function () {
    var _this = this
    if (_this.data.allowGetCode) {

      _this.setData({
        allowGetCode: false,
        authcodeText: second + '秒 重发',
      });
      _this.getPhoneCode()//加载加密方法
      // wx.request 发送获取验证码请求
      wx.request({
        url: app.globalData.apiUrl_two + 'wxmp/user/sendCode?datatype=json',
        method: "POST",
        header: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        data: {
          phone: phonecode,
          rand: rand,
        },
        success: function (res) {
          console.log(res)
        }
      })
      // 发送验验码
      wx.showToast({
        title: '验证码已发送，请查收！',
        icon: 'none',
        mask: true,
        duration: 2000
      })


      // 倒计时
      interval = setInterval(function () {
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
          second = 60
        }
      }.bind(this), 1000);
    }
  },
  /**
   * 登录提交事件方法
   */
  bindFormSubmit: function (e) {
    var _this = this
    if (/^[a-zA-Z0-9_-]+$/.test(_this.data.name)) {
      //显示 loading 提示框
      wx.showLoading({
        title: '注册中，请稍候...',
        mask: true
      })
      //获取微信小程序的code值
      wx.login({
        success: function (res) {
          _this.setData({
            code: res.code
          })
          _this.register()
        }
      })
    } else {
      wx.showToast({
        title: '用户名仅限英文、数字、中线、下划线',
        icon: 'none'
      })
    }
  },
   /**
   * 执行注册时的方法
   */
  register:function(){
    var _this = this
    var entrance = wx.getStorageSync('entrance')//获取入口的参数信息
    //执行登录操作
    wx.request({
      //按实际所需调整api
      url: app.globalData.apiUrl_two + 'wxmp/user/register?datatype=json',
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      data: {
        uname: _this.data.name,
        phone: _this.data.phone,
        rname: _this.data.code,
        upass: _this.data.authcode,
        majorId: entrance.query.majorId,
        subcenterId: entrance.query.subcenterId,
        salesmanId: entrance.query.salesmanId,
      },
      success: function (res) {
        console.log(res.data)

        wx.hideLoading() //隐藏 loading 提示框
        if (res.data.success) {
          //注册成功
          wx.showToast({
            title: '注册成功！',
            icon: 'none',
            mask: true,
            duration: 2000
          })

          //更新本地存储用户信息
          try {
            wx.setStorageSync('userInfo', res.data.userInfo)
          } catch (e) { }

          //更新全局共享数据
          app.globalData.userInfo = res.data.userInfo

          // 延迟
          setTimeout(function () {
            // 关闭所有页面，打开到应用内的某个页面
            wx.reLaunch({
              url: '/pages/user/user'
            })
          }, 2000)

        } else {
          //操作失败
          wx.showToast({
            title: '操作失败！' + res.data.message,
            icon: 'none',
            duration: 4000
          })
        }
      },
      fail: function () {
        wx.hideLoading() //隐藏 loading 提示框
      },
      complete: function (res) { }
    })
  },
  /**
   * 手机号码加密方法
   */
  getPhoneCode:function(){
    rand = Math.floor(Math.random() * 1000);//获取0-1000的随机数
    phonecode = parseInt(phonecode)//将手机号码转换成int类型
    phonecode = phonecode + rand//字符串与随机数拼接
    phonecode = phonecode.toString(16)//将拼接的数字转换成16进制
  }
});