//获取应用实例
const app = getApp()
const sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置

Page({
  data: {
    packages: 0, //套餐(课程包)ID
    poster: '', //预览图
    tabs: ["课程信息", "包含课程", "课程简介"], //tab标签，不许为空
    activeTab: 0, //当前活动tab标签
    sliderOffset: 0, //tab标签偏移量
    sliderLeft: 0, //tab标签左边距
    listData: [] //套餐(课程包)数据
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: options.title
    })

    var _this = this

    //初始化
    wx.getSystemInfo({
      success: function(res) {
        _this.setData({
          packages: options.id, //套餐(课程包)ID
          poster: options.poster, //预览图
          sliderLeft: (res.windowWidth / _this.data.tabs.length - sliderWidth) / 2
        });
      }
    });

    // 加载导航数据
    this.funLoadData()

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },
  /**
   * 顶部导航数据
   */
  funLoadData: function() {
    var _this = this

    var usrid = 0,
      token = 0;
    if (app.globalData.userInfo) {
      usrid = app.globalData.userInfo.usrid
      token = app.globalData.userInfo.token
    }


    wx.showNavigationBarLoading(); //在当前页面显示导航条加载动画
    wx.request({
      url: app.globalData.apiUrl + 'package/getPackageInfo',
      method: "POST",
      data: {
        packages: _this.data.packages, //套餐(课程包)ID
        usrid: usrid, //用户ID
        token: token //用户token
      },
      success: function(res) {
        console.log(res.data)
        if (res.data.code == 0) {
          _this.setData({
            listData: res.data.data
          })
        } else {
          console.log(res.data.msg + ', CODE:' + res.data.code)
        }

      },
      complete: function(res) {
        wx.hideNavigationBarLoading() //隐藏导航条加载动画
      }
    })
  },
  //标签切换点击
  bindTabClick: function(e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeTab: e.currentTarget.id
    })
  },
  // 
  bindInfoDeduction: function() {
    wx.showToast({
      title: '购买时，最大可抵扣数',
      icon: 'none',
      duration: 2000
    })
  },
  // 赠币提示信息
  bindInfoGive: function() {
    wx.showToast({
      title: '购买后返赠数，可用于下次购买抵扣',
      icon: 'none',
      duration: 2000
    })
  },
  // 购买按钮事件
  bindBuy: function(){
    if (app.globalData.userInfo && parseInt(app.globalData.userInfo.usrid) > 0 ){
      wx.showModal({
        // title: '温馨提醒',
        content: '功能完善中……',
        showCancel: false
      })
    }else{
      wx.showModal({
        // title: '温馨提醒',
        content: '您还未登录，不能购买',
        confirmText:'立即登录',
        success(res) {
          if (res.confirm) {
            // 跳转至（用户）登录页
            wx.redirectTo({
              url: '/pages/user/user'
            })
          } 
        }
      })
    }
  }
})