//app.js
App({
  /**
   * 启动后全局只加载一次
   */
  onLaunch: function () {
    // 设置是否保持常亮状态。仅在当前小程序生效，离开小程序后设置失效。
    wx.setKeepScreenOn({
      keepScreenOn: true
    })
  },
  /**
   * 全局初始化数据
   */
  globalData: {
    userInfo: null,  
    projectId:1, //项目ID
    apiUrl: "https://api.huanggao.net/qkdemo/", //接口前缀
    apiUrl_two:"http://192.168.1.101:8080/",//调试接口
    shareTitle: "太奇管理类联考", //分享转发标题
    sharePath: '/pages/welcome/welcome', //分享转发页面
    company: "北京太奇教育科技股份有限公司",  //公司名称
    site: "www.qikao.net", //网址
  }
})