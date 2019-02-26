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
    examAreaHeight: 0, //答题区域高度
    partAHeight: 0, //A区高度，百分比值，材料及问题
    partBHeight: 0, //B区高度，百分比值，完形及阅读理解多问专属
    partCHeight: 0, //C区高度，百分比值，除问答型题无此外，其它题型均有
    listData: '', // 数据列表
    activIndex: 0, // 当前试题
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: options.title
    })

    var _this = this
    wx.getSystemInfo({
      success: function(res) {
        _this.setData({
          examAreaHeight: res.windowHeight - 60,
          id: options.id, //试卷ID
          source: options.source //试题来源类型：1-题库、2-内容
        });
      }
    });

    // 加载数据
    _this.funLoadListData(options.id, options.source)
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
  funLoadListData: function() {
    var _this = this

    wx.showNavigationBarLoading(); //在当前页面显示导航条加载动画
    wx.request({
      url: app.globalData.apiUrl + 'exam/getQuestions',
      method: "POST",
      data: {
        id: _this.data.id, //试题ID
        source: _this.data.source //试题来源类型：1-题库、2-内容
      },
      success: function(res) {
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
      complete: function(res) {
        wx.hideNavigationBarLoading() //隐藏导航条加载动画
      }
    })
  },
  /**
   * 格式化布局及数据
   */
  funFormatView: function() {
    var _this = this

    // ABC区高度
    var partAHeight = 94,
      partBHeight = 0,
      partCHeight = 5;


    // 试题类型为文本，即问答型
    if (_this.data.listData[_this.data.activIndex].types.ans_input_type === 'text') {
      partAHeight = 99
      partBHeight = 0
      partCHeight = 0
    }

    // 选项数量
    var question_nums = parseInt(_this.data.listData[_this.data.activIndex].types.question_nums)

    if (question_nums > 1) {
      // 完型填空 & 阅读理解
      partAHeight = 54
      partBHeight = 30
      partCHeight = 15
    }

    _this.setData({
      partAHeight: partAHeight, //A区高度，百分比值，材料及问题
      partBHeight: partBHeight, //B区高度，百分比值，完形及阅读理解多问专属
      partCHeight: partCHeight, //C区高度，百分比值，除问答型题无此外，其它题型均有
    })

    // 材料
    var materials = _this.data.listData[_this.data.activIndex].question.materials
    WxParse.wxParse('materials', 'html', materials, _this, 5)

    // 问题
    WxParse.wxParse('question', 'html', _this.data.listData[_this.data.activIndex].question.question, _this, 5)

    // 子选项
    WxParse.wxParse('subQuestion', 'html', _this.data.listData[_this.data.activIndex].question.subQuestion, _this, 5)


  },
  /**
   * 上一题
   */
  bindPre: function(e) {
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
  bindNext: function(e) {
    var _this = this
    var activIndex = _this.data.activIndex
    if (activIndex < _this.data.listData.length) {
      if ((_this.data.listData[activIndex].types.ans_input_type !== 'text') && (_this.data.listData[activIndex].types.ans_input_nums > 1)) {
        _this.funSubmit() //提交答案
      } else {
        // 主观题
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


    }

  },

  /**
   * 提交答案 (客观题)
   */
  funSubmit: function() {
    var _this = this
    var activIndex = _this.data.activIndex
    var ans_input_type = _this.data.listData[activIndex].types.ans_input_type //选择类型
    var question_nums = _this.data.listData[activIndex].types.question_nums //子题量
    var ans_input_nums = _this.data.listData[activIndex].types.ans_input_nums //选项个数

    var userAnswers = [] //用户答案

    for (var i = 0; i < question_nums; ++i) {
      var values = ''; //选项选中的值
      for (var j = 0; j < ans_input_nums; ++j) {
        if (_this.data.listData[activIndex].question.options[i][j].checked) {
          values += _this.data.listData[activIndex].question.options[i][j].value
        }
      }
      var data = {
        id: i + 1,
        value: values
      }

      userAnswers.push(data);
    }

    console.log(userAnswers);
    // 如果要直接记录用户答案对错，可以在这里直接比较一下
    


    // 数据提交
    wx.request({
      url: app.globalData.apiUrl + 'exam/submitAnswer',
      method: "POST",
      data: {
        id: _this.data.id, //试卷ID
        source: _this.data.source, //试卷试题来源类型：1-题库、2-内容
        question: activIndex, //当前试题
        userAnswers: JSON.stringify(userAnswers) //用户答案
      },
      success: function(res) {
        console.log(res.data)

        if (res.data.code == 0) {
          if (activIndex == (_this.data.listData.length - 1)) {
            //是最后一题，直接返回上一级
            wx.navigateBack({
              delta: 1
            })
          } else {
            _this.setData({
              activIndex: _this.data.activIndex + 1
            })

            _this.funFormatView() //格式化布局及数据
          }


        } else {
          console.log(res.data.msg + ', CODE:' + res.data.code)
        }

      },
      complete: function(res) {

      }
    })
  },


  /**
   * 客观题 选择事件
   */
  bindOptionsChange: function(e) {
    var index = e.currentTarget.dataset.index; // 当前选项索引：子题号
    var value = e.detail.value; // 勾选选中的选项值

    var _this = this;
    var activIndex = _this.data.activIndex; // 当前试题
    var listData = _this.data.listData; // 源数据
    var types = listData[activIndex].types.ans_input_type; //当前试题类型

    var options = listData[activIndex].question.options[index]; //重新获取选项数据

    if (types == 'radio') {
      // 单选 readio
      for (var j = 0, len = options.length; j < len; ++j) {
        options[j].checked = options[j].value == value;
      }
    } else {
      // 多选 checkbox
      for (var i = 0, lenI = options.length; i < lenI; ++i) {
        options[i].checked = false;
        for (var j = 0, lenJ = value.length; j < lenJ; ++j) {
          if (options[i].value == value[j]) {
            options[i].checked = true;
            break;
          }
        }
      }
    }

    listData[activIndex].question.options[index] = options; // 重新赋值：选项选中状态
    // console.log(listData[activIndex].question.options[index]);


    // 回写data
    this.setData({
      listData: listData
    })


  }




})