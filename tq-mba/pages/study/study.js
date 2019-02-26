//获取应用实例
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    listData: [], //列表数据
    pages: 1, // 当前页数
    limit: 12, //每页返回记录数
    isEnd: false, //记录已全部加载完毕
    newPlan: false, //是否有7天内新添加的计划
    newDoc: false, //是否有7天内新上传的资料
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: '学习中心'
    })

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
   * 加载用户数据
   */
  funLoadListData: function() {
    var _this = this

    if (app.globalData.userInfo && parseInt(app.globalData.userInfo.usrid) > 0) {
      wx.showNavigationBarLoading(); //在当前页面显示导航条加载动画
      wx.request({
        url: app.globalData.apiUrl + 'knowledge/getUserCourse',
        method: "POST",
        data: {
          usrid: app.globalData.userInfo.usrid, //用户ID
          token: app.globalData.userInfo.token, //用户token
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
              isEnd: isEnd,
              newPlan: res.data.newPlan,
              newDoc: res.data.newDoc
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
    }


  },

  /**
   * 顶部子栏目导航点击事件
   */
  bindStudyNav: function(e) {
    var url = ''
    switch (e.currentTarget.dataset.type) {
      case 'words': //奇记单词
        url = '/pagesKnowledge/knowledge_words/knowledge_words?title=奇记单词'
        break;

      case 'reference': //备考诊断
        // url = '/pagesKnowledge/knowledge_reference/knowledge_reference?title=备考诊断'
        break;

      case 'interview': //面试测评
        // url = '/pagesKnowledge/knowledge_interview/knowledge_interview?title=面试测评'
        break;

      case 'plans': //学习计划
        // url = '/pagesKnowledge/knowledge_plans/knowledge_plans?title=学习计划'
        break;

      case 'docs': //资料下载
        url = '/pagesKnowledge/knowledge_docs/knowledge_docs?title=资料下载'
        break;

      default:
    }

    if (!!url) {
      if (app.globalData.userInfo && app.globalData.userInfo.usrid) {
        wx.navigateTo({
          url: url
        })
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
    } else {
      wx.showModal({
        // title: '温馨提醒',
        content: '功能完善中……',
        showCancel: false
      })
    }


  }


})