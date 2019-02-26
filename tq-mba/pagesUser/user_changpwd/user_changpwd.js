const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: '我'
    })
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
   * 原密码输入事件
   */
  bindOldPwdInput: function(e) {
    this.setData({
      oldpwd: e.detail.value.trim()
    })
  },
  /**
   * 新密码输入事件
   */
  bindNewPwdInput: function(e) {
    this.setData({
      newpwd: e.detail.value.trim()
    })
  },

  /**
   * 登录提交事件方法
   */
  bindFormSubmit: function(e) {
    var _this = this
    if (!!(_this.data.oldpwd.length>6) && !!(_this.data.newpwd.length > 6)) {
      //显示 loading 提示框
      wx.showLoading({
        title: '处理中，请稍候...',
        mask: true
      })

      //执行登录操作
      wx.request({
        //按实际所需调整api
        url: app.globalData.apiUrl + 'User/changPwd',
        method: "POST",
        data: {
          usrid: app.globalData.userInfo.usrid,
          oldpwd: _this.data.oldpwd,
          newpwd: _this.data.newpwd
        },
        success: function(res) {
          console.log(res.data)

          wx.hideLoading() //隐藏 loading 提示框
          if (res.data.code == 0) {
            //修改成功
            wx.showToast({
              title: '修改成功！',
              icon: 'success',
              mask: true,
              duration: 2000
            })

            // 延迟
            setTimeout(function () {
              // 返回上一页
              wx.navigateBack({
                delta: 1
              })
            }, 2000)

            
          } else {
            //操作失败
            wx.showToast({
              title: '操作失败！' + res.data.code,
              icon: 'none',
              duration: 4000
            })
          }
        },
        fail: function () {
          wx.hideLoading() //隐藏 loading 提示框
        },
        complete: function(res) {
         
        }
      })

    }else{
      wx.showToast({
        title: '密码必须为6-20位',
        icon: 'none',
        duration: 2000
      })
    }
  }
});