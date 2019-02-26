//获取应用实例
const app = getApp()

Page({
  data: {
    menuData: [], //导航数据
    menuScrollLeftStages: 0, //导航左边距偏移量:阶段
    menuCurrentTabStages: 0, //导航当前选中:阶段
    menuScrollLeftProject: 0, //导航左边距偏移量:子项目
    menuCurrentTabProject: 0, //导航当前选中:子项目
    menuScrollLeftSubject: 0, //导航左边距偏移量:学科
    menuCurrentTabSubject: 0, //导航当前选中:学科
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

    

    // 接收并处理 阶段 参数
    var optionsStages = 0
    if (options.stages){
      optionsStages = parseInt(options.stages) 
    }

    // 接收并处理 学科 参数
    var optionsSubject = 0
    if (options.subject) {
      optionsSubject = parseInt(options.subject)
    }

    // 根据参数初始化导航选中项
    this.setData({
      menuCurrentTabStages: optionsStages, //导航当前选中:阶段
      menuCurrentTabSubject: optionsSubject, //导航当前选中:学科
    })

    // 加载导航数据
    this.funLoadMenuData()

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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

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
   * 顶部导航数据
   */
  funLoadMenuData: function () {
    var _this = this
    wx.showNavigationBarLoading(); //在当前页面显示导航条加载动画
    wx.request({
      url: app.globalData.apiUrl + 'package/getPackageMenu',
      method: "POST",
      data: {

      },
      success: function (res) {
        console.log(res.data)
        if (res.data.code == 0) {
          _this.setData({
            menuData: res.data.data
          })

          //加载列表数据
          _this.funLoadListData()
        } else {
          wx.showModal({
            title: '发生错误：',
            showCancel: false,
            confirmText: '返回',
            content: res.data.msg + ', CODE:' + res.data.code,
            success: function (res) {
              if (res.confirm) {
                wx.navigateBack()
              }
            }
          })
        }

      },
      complete: function (res) {
        wx.hideNavigationBarLoading() //隐藏导航条加载动画
      }
    })
  },
  /**
   * 加载数据
   */
  funLoadListData: function () {
    var _this = this
    //每个tab选项宽度占1/5，此值修改时，需要同步修改对应样式
    var singleNavWidth = wx.getSystemInfoSync().windowWidth / 5;

    //选中tab项显示位置
    _this.setData({
      menuScrollLeftStages: (parseInt(_this.data.menuCurrentTabStages) - 2) * singleNavWidth,
      menuScrollLeftProject: (parseInt(_this.data.menuCurrentTabProject)- 2) * singleNavWidth,
      menuScrollLeftSubject: (parseInt(_this.data.menuCurrentTabSubject) - 2) * singleNavWidth
    })


    // 获取列表数据
    wx.showNavigationBarLoading(); //在当前页面显示导航条加载动画
    wx.request({
      url: app.globalData.apiUrl + 'package/getPackage',
      method: "POST",
      data: {
        stages: _this.data.menuData.stages[_this.data.menuCurrentTabStages].id, //阶段ID
        project: _this.data.menuData.project[_this.data.menuCurrentTabProject].id, //子项目ID
        subject: _this.data.menuData.subject[_this.data.menuCurrentTabSubject].id, //学科ID
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

  },
  /**
   * 切换导航：阶段
   */
  bindSwitchTabStages: function (event) {
    var _this = this
    var current = event.currentTarget.dataset.current;
    if (_this.data.menuCurrentTabStages == current) {
      return false;
    } else {
      //tab 切换，重新加载新栏目的数据
      _this.setData({
        pages: 1,
        isEnd: false,
        listData: [],
        menuCurrentTabStages: current
      })
      _this.funLoadListData()
    }
  },
  /**
   * 切换导航：子项目
   */
  bindSwitchTabProject: function (event) {
    var _this = this
    var current = event.currentTarget.dataset.current;
    if (_this.data.menuCurrentTabProject == current) {
      return false;
    } else {
      //tab 切换，重新加载新栏目的数据
      _this.setData({
        pages: 1,
        isEnd: false,
        listData: [],
        menuCurrentTabProject: current
      })
      _this.funLoadListData()
    }
  },
  /**
   * 切换导航：学科
   */
  bindSwitchTabSubject: function (event) {
    var _this = this
    var current = event.currentTarget.dataset.current;
    if (_this.data.menuCurrentTabSubject == current) {
      return false;
    } else {
      //tab 切换，重新加载新栏目的数据
      _this.setData({
        pages: 1,
        isEnd: false,
        listData: [],
        menuCurrentTabSubject: current
      })
      _this.funLoadListData()
    }
  },

})