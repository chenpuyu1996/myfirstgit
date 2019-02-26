//获取应用实例
const app = getApp()

Page({
  data: {
    vodHeight: 225, //视频高度
    vod: 0, // 视频ID
    vodData: [], //视频信息
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    // 当前页导航标题
    wx.setNavigationBarTitle({
      title: options.title
    })

    this.setData({
      vodHeight: Math.ceil((wx.getSystemInfoSync().windowWidth * 360) / 640), //计算视频高度
      vod: options.vod, // 视频ID
    })

    // 视频播放器
    this.videoContext = wx.createVideoContext('myVideo')
    // this.videoContext.requestFullScreen() //自动全屏
    // 加载视频数据
    this.funVodInfo()
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

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
   * 获取视频信息
   */
  funVodInfo: function () {
    var _this = this

    wx.showNavigationBarLoading(); //在当前页面显示导航条加载动画
    wx.request({
      url: app.globalData.apiUrl + 'exam/getVodInfo',
      method: "POST",
      data: {
        vod: _this.data.vod, // 视频ID
      },
      success: function (res) {
        console.log(res.data)
        if (res.data.code == 0) {
          _this.setData({
            vodHeight: Math.ceil((wx.getSystemInfoSync().windowWidth * parseInt(res.data.data.vod_height)) / parseInt(res.data.data.vod_width)), //根据视频信息重新计算视频高度
            vodData: res.data.data
          })

        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 3000
          })
        }
      },
      complete: function (res) {
        wx.hideNavigationBarLoading() //隐藏导航条加载动画
      }
    })
  },
  /**
   * 视频播放完毕
   */
  bindVideoEnded: function () {
    // console.log('播放完毕');
  },
  /**
   * 视频播放出错
   */
  bindVideoErrorCallback: function (e) {
    // console.log('视频错误信息:')
    // console.log(e.detail.errMsg)
  }
})