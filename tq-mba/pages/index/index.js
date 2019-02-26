//获取应用实例
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    lessons: {},
    packages: {},

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: '太奇管理类联考'
    })

    this.funLoadData()
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 如果要做从其它页面返回后，重载页面内容，需将数据加载功能从onload移至此处
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
   * 加载数据
   */
  funLoadData: function() {
    // 演示示例分开加载，正式版可考虑合并加载
    this.funLoadLessons() //加载体验课程
    this.funLoadPackages() //加载套餐
  },
  /**
   * 加载体验课程
   */
  funLoadLessons: function() {
    var _this = this

    // wx.showNavigationBarLoading(); //在当前页面显示导航条加载动画
    wx.request({
      url: app.globalData.apiUrl + 'Index/getLessonFree',
      method: "POST",
      data: {

      },
      success: function(res) {
        console.log(res.data)
        var isEnd = false
        if (res.data.code == 0) {
          _this.setData({
            lessons: res.data.data
          })

        } else {
          console.log(res.data.msg + ', CODE:' + res.data.code)
        }

      },
      complete: function(res) {
        // wx.hideNavigationBarLoading() //隐藏导航条加载动画
      }
    })
  },
  /**
   * 加载套餐
   */
  funLoadPackages: function() {
    var _this = this

    wx.showNavigationBarLoading(); //在当前页面显示导航条加载动画
    wx.request({
      url: app.globalData.apiUrl + 'Index/getPackages',
      method: "POST",
      data: {

      },
      success: function(res) {
        console.log(res.data)
        var isEnd = false
        if (res.data.code == 0) {
          _this.setData({
            packages: res.data.data
          })

        } else {
          console.log(res.data.msg + ', CODE:' + res.data.code)
        }

      },
      complete: function(res) {
        wx.hideNavigationBarLoading() //隐藏导航条加载动画
      }
    })
  }

})