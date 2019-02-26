//获取应用实例
const app = getApp()

Page({
  data: {
    course: 0, //课程ID
    listData: [], //列表数据
    pages: 1, // 当前页数
    limit: 12, //每页返回记录数
    isEnd: false, //记录已全部加载完毕
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: options.title
    })

    this.setData({
      course: options.course
    })

    // 加载数据
    this.funLoadListData()

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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (!(this.data.isEnd)) {
      this.setData({
        pages: parseInt(this.data.pages) + 1, // 当前页数
      })
      //初始记录显示条数如果不足一屏，将无法实现上拉翻页功能
      this.funLoadListData()
    }
  },
  /**
   * 加载数据
   */
  funLoadListData: function () {
    var _this = this
    
    if (app.globalData.userInfo && parseInt(app.globalData.userInfo.usrid) > 0) {
      // 获取列表数据
      wx.showNavigationBarLoading(); //在当前页面显示导航条加载动画
      wx.request({
        url: app.globalData.apiUrl + 'knowledge/getCourseLesson',
        method: "POST",
        data: {
          course: _this.data.course, //课程ID
          usrid: app.globalData.userInfo.usrid, //用户ID
          token: app.globalData.userInfo.token,  //用户token
          pages: _this.data.pages, //当前页
          limit: _this.data.limit, //每页记录数
        },
        success: function (res) {
          console.log(res.data)
          var isEnd = false
          if (res.data.code == 0) {
            var listData = _this.data.listData.concat(res.data.data)
            //已加载数据 大于 总记录数 ，不再加载
            if ((parseInt(res.data.pages) * parseInt(_this.data.limit)) > res.data.count) {
              isEnd = true
            }

            _this.setData({
              listData: listData,
              isEnd: isEnd
            })
          } else {
            _this.setData({
              isEnd: isEnd
            })
          }
        },
        complete: function (res) {
          wx.hideNavigationBarLoading() //隐藏导航条加载动画
        }
      })
    }
    

  },

})