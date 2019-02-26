//获取应用实例
const app = getApp()

Page({
  data: {
    listData: [], //列表数据
    pages: 1, // 当前页数
    limit: 12, //每页返回记录数
    isEnd: false, //记录已全部加载完毕
    loading: false, //文档是否加载中
    progress: '0%', //加载进度
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: options.title
    })

    // 加载数据
    this.funLoadListData()

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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
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
  funLoadListData: function() {
    var _this = this
    var usrid = 0 //用户ID
    if (app.globalData.userInfo && app.globalData.userInfo.usrid) {
      // 获取列表数据
      // 加载所有 注册用户权限的文档 + 当前用户特有权限文档

      wx.showNavigationBarLoading(); //在当前页面显示导航条加载动画
      wx.request({
        url: app.globalData.apiUrl + 'knowledge/getDocs',
        method: "POST",
        data: {
          usrid: app.globalData.userInfo.usrid, //用户ID
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

  /**
   * 查看文档
   */
  bindViewDocs: function(e) {
    var _this = this
    var id = e.currentTarget.dataset.id // 文档id
    var url = e.currentTarget.dataset.src // 文档URL

    // 下载监听进度
    const downloadTask = wx.downloadFile({
      url: url,
      success: function (res) {
        if (res.statusCode === 200) {
          var filePath = res.tempFilePath
          // 打开文档
          wx.openDocument({
            filePath,
            success: function (res) {
              _this.funSynHits(id) //更新点击数
            },
            fail: function (res) {
              wx.showToast({
                title: '打开文档失败',
                icon: 'none'
              })
            }
          })
        } else {
          wx.showToast({
            title: '文档加载失败',
            icon: 'none'
          })
        }
      }
    })

    // 显示加载进度
    downloadTask.onProgressUpdate((res) => {
      if (res.progress === 100) {
        _this.setData({
          loading: false,
          progress: ''
        })

        downloadTask.offProgressUpdate() //取消监听下载进度变化事件
        // downloadTask.abort() // 取消下载任务
      } else {
        _this.setData({
          loading: true,
          progress: res.progress + '%'
        })
      }
    })

    

  },

  /**
   * 更新点击数（只发不收）
   */
  funSynHits: function(id) {
    console.log(id)

    wx.request({
      url: app.globalData.apiUrl + 'knowledge/docsHit',
      method: "POST",
      data: {
        id: parseInt(id), //文档ID
        usrid: app.globalData.userInfo.usrid, //用户ID
        token: app.globalData.userInfo.token, //用户token
      }
    })
  }

})