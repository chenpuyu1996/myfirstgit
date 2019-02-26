//获取应用实例
const app = getApp()
const WxParse = require('../../wxParse/wxParse.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    id: 0, //试卷ID
    source: 0, //试题来源类型：1-题库、2-内容
    listData: '', // 数据列表
    activIndex: 0, // 当前试题
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
      id: options.id, //试卷ID
      source: options.source //试题来源类型：1-题库、2-内容
    });

    // 加载数据
    this.funLoadListData(options.id, options.source)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 如果要做从其它页面返回后，重载页面内容，需将数据加载功能从onload移至此处
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
   * 加载数据
   */
  funLoadListData: function () {
    var _this = this

    wx.showNavigationBarLoading(); //在当前页面显示导航条加载动画
    wx.request({
      url: app.globalData.apiUrl + 'exam/getQuestionsAnswer',
      method: "POST",
      data: {
        id: _this.data.id, //试题ID
        source: _this.data.source //试题来源类型：1-题库、2-内容
      },
      success: function (res) {
        console.log(res.data)

        if (res.data.code == 0) {
          if (res.data.data.length > 0) {
            _this.setData({
              listData: res.data.data
            })

            _this.funFormatView() //格式化布局及数据
          }

        } else {
          console.log(res.data.msg + ', CODE:' + res.data.code)
        }

      },
      complete: function (res) {
        wx.hideNavigationBarLoading() //隐藏导航条加载动画
      }
    })
  },
  /**
   * 格式化布局及数据
   */
  funFormatView: function () {
    var _this = this

    // 材料
    var materials = _this.data.listData[_this.data.activIndex].question.materials
    WxParse.wxParse('materials', 'html', materials, _this, 5)

    // 问题
    WxParse.wxParse('question', 'html', _this.data.listData[_this.data.activIndex].question.question, _this, 5)

    // 子选项
    WxParse.wxParse('subQuestion', 'html', _this.data.listData[_this.data.activIndex].question.subQuestion, _this, 5)

    // 解析
    WxParse.wxParse('explain', 'html', _this.data.listData[_this.data.activIndex].question.explain, _this, 5)


  },
  /**
   * 上一题
   */
  bindPre: function (e) {
    var _this = this
    var activIndex = _this.data.activIndex
    if (activIndex > 0) {
      _this.setData({
        activIndex: activIndex - 1
      })

      _this.funFormatView() //加载新题数据
    }
  },
  /**
   * 下一题
   */
  bindNext: function (e) {
    var _this = this
    var activIndex = _this.data.activIndex
    if (activIndex < _this.data.listData.length) {
      if (activIndex == (_this.data.listData.length - 1)) {
        //是最后一题，直接返回上一级
        wx.navigateBack({
          delta: 1
        })
      } else {
        _this.setData({
          activIndex: activIndex + 1
        })
        _this.funFormatView() //加载新题数据
      }
    }

  },
/**
 * 查看数据统计
 */
  bindCount:function(){
    var _this = this;
    var activIndex = _this.data.activIndex; // 当前试题
    var listData = _this.data.listData; // 源数据
    
    // 仅当未获取过数据时才加载
    if (!!!listData[activIndex].count){
      wx.showNavigationBarLoading(); //在当前页面显示导航条加载动画
      wx.request({
        url: app.globalData.apiUrl + 'exam/getQuestionsCount',
        method: "POST",
        data: {
          id: _this.data.id, //试卷ID
          qid: activIndex, //试题ID
          ans_input_nums: listData[activIndex].types.ans_input_nums, //演示用参数：选项个数
          question_nums: listData[activIndex].types.question_nums //演示用参数：子题数量
        },
        success: function (res) {
          console.log(res.data)

          if (res.data.code == 0) {
            listData[activIndex].count = res.data.data;

            _this.setData({
              listData: listData
            })

            console.log(_this.data.listData)

          } else {
            console.log(res.data.msg + ', CODE:' + res.data.code)
          }

        },
        complete: function (res) {
          wx.hideNavigationBarLoading() //隐藏导航条加载动画
        }
      })
    }

    

  }



})