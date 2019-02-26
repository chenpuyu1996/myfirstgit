//获取应用实例
const app = getApp()
const sliderWidth = 40; // 需要设置slider的宽度，用于计算中间位置

Page({
  /**
   * 页面的初始数据
   */
  data: {
    tabs: [{
      "id": 1,
      "name": "综合"
    }, {
      "id": 2,
      "name": "英语"
    }],
    activeTab: 0, //当前活跃标签
    sliderOffset: 0, //左偏移量
    sliderLeft: 0, //左边距
    listData: [], //列表数据
    pages: 1, // 当前页数
    limit: 12, //每页返回记录数
    isEnd: false, //记录已全部加载完毕
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: '历年真题'
    })

    //初始化
    var _this = this;
    wx.getSystemInfo({
      success: function(res) {
        _this.setData({
          sliderLeft: (res.windowWidth / _this.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / _this.data.tabs.length * _this.data.activeTab
        });
      }
    });


  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 如果要做从其它页面返回后，重载页面内容，需将数据加载功能从onload移至此处
    // 加载数据
    this.funLoadListData()
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
    var usrid = 0,
      token = 0

    if (app.globalData.userInfo && parseInt(app.globalData.userInfo.usrid) > 0) {
      usrid = app.globalData.userInfo.usrid //用户ID
      token = app.globalData.userInfo.token //用户token
    }

    // 获取列表数据
    wx.showNavigationBarLoading(); //在当前页面显示导航条加载动画
    wx.request({
      url: app.globalData.apiUrl + 'knowledge/getPast',
      method: "POST",
      data: {
        usrid: usrid, //用户ID
        token: token, //用户token
        subject: _this.data.tabs[this.data.activeTab].id, //学科ID
        pages: _this.data.pages, //当前页
        limit: _this.data.limit, //每页记录数
      },
      success: function(res) {
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
      complete: function(res) {
        wx.hideNavigationBarLoading() //隐藏导航条加载动画
      }
    })

  },
  // 学科标签切换点击事件
  bindTabClick: function(e) {
    var _this = this
    var activeTab = e.currentTarget.id;
    if (_this.data.activeTab == activeTab) {
      return false;
    } else {
      //tab 切换，重新加载新栏目的数据
      _this.setData({
        pages: 1,
        isEnd: false,
        listData: [],
        sliderOffset: e.currentTarget.offsetLeft,
        activeTab: activeTab
      })
      _this.funLoadListData()
    }

  },
  /**
   * 列表点击事件
   */
  bindExame: function(e) {
    var index = e.currentTarget.dataset.id //列表索引

    var id = this.data.listData[index].id //试卷ID
    var title = this.data.listData[index].name //试卷名
    var progress = this.data.listData[index].progress //用户答题完成度
    var source = this.data.listData[index].source //试卷来源类型:1-题库、2-内容

    // 判断用户登录状态
    if (app.globalData.userInfo && parseInt(app.globalData.userInfo.usrid) > 0) {
      var url = '';
      if (source == 1) {
        // 题库
        if (progress == 2) {
          // 已完成
          url = '/pagesExam/exam_view/exam_view?title=' + title + '&id=' + id + '&source=' + source
        } else {
          // 未开测或测试进行中
          url = '/pagesExam/exam_papers/exam_papers?title=' + title + '&id=' + id + '&source=' + source
        }
      } else {
        // 自添加上传内容，不提供答题功能
        url = '/pagesExam/exam_papers_content/exam_papers_content?title=' + title + '&id=' + id + '&source=' + source
      }

      // 页面跳转
      if (url.length) {
        wx.navigateTo({
          url: url,
        })
      }

    } else {
      wx.showModal({
        // title: '温馨提醒',
        content: '您还未登录，请先登录！',
        confirmText: '立即登录',
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