//获取应用实例
const app = getApp()

Page({
  data: {
    rights: 1, //默认需要权限检测
    vodHeight: 225, //视频高度
    lesson: 0, // 课件ID
    lessonData: [], //课件信息
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    // 当前页导航标题
    wx.setNavigationBarTitle({
      title: options.title
    })

    this.setData({
      rights: options.rights, //是否需要权限检测
      vodHeight: Math.ceil((wx.getSystemInfoSync().windowWidth * 360) / 640), //计算视频高度
      lesson: options.lesson, // 课件ID
      vodPoster: options.poster, // 视频封面
    })

    // 视频播放器
    this.videoContext = wx.createVideoContext('myVideo')
    // this.videoContext.requestFullScreen() //自动全屏
    // 加载课件数据
    this.funLessonInfo()
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
   * 获取课件信息
   */
  funLessonInfo: function() {
    var _this = this,
      usrid = 0, // 用户ID
      token = 0; // 用户token

    // 需要权限检测时
    if (_this.data.rights && app.globalData.userInfo) {
      usrid = app.globalData.userInfo.usrid // 用户ID
      token = app.globalData.userInfo.token // 用户token
    }

    wx.showNavigationBarLoading(); //在当前页面显示导航条加载动画
    wx.request({
      url: app.globalData.apiUrl + 'knowledge/getLessonInfo',
      method: "POST",
      data: {
        rights: _this.data.rights, //是否需要权限检测
        lesson: _this.data.lesson, // 课件ID
        usrid: usrid,
        token: token,
      },
      success: function(res) {
        console.log(res.data)
        if (res.data.code == 0) {
          _this.setData({
            vodHeight: Math.ceil((wx.getSystemInfoSync().windowWidth * parseInt(res.data.data.lesson.vod_height)) / parseInt(res.data.data.lesson.vod_width)), //根据视频信息重新计算视频高度
            lessonData: res.data.data.lesson
          })

        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 3000
          })
        }
      },
      complete: function(res) {
        wx.hideNavigationBarLoading() //隐藏导航条加载动画
      }
    })
  },
  /**
   * 视频播放完毕
   */
  bindVideoEnded: function() {
    // console.log('播放完毕');
  },
  /**
   * 视频播放出错
   */
  bindVideoErrorCallback: function(e) {
    // console.log('视频错误信息:')
    // console.log(e.detail.errMsg)
  }
})