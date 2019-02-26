//获取应用实例
const app = getApp()
const wordsTotal = 5498 //单词总数
const wordsPerUnit = 30 //每单元单词数
var repeat = 3; //重复次数
var innerAudioContext = null

Page({
  data: {
    listData: [], //单词数据
    activeData: 0, //当前单词
    unit: [], //单元
    unitIndex: 0, //当前单元 
    isPlay: false, //播放中
    isLoop: false, //是否循环播放（每词循环播放3遍）
    isSpellwords: false, //是否 拼读 + 整读
    urlSoundmrk: 'http://hw.hgznedu.com/Words/soundmark/', //URL前缀：音标图片jpg
    urlPic: 'http://hw.hgznedu.com/Words/pic/' //URL前缀：助记图片jpg
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: options.title
    })

    // 从本地缓存中读取设置数据
    try {
      var unitIndex = wx.getStorageSync('EngWordsUnitIndex') //当前单元
      if (!unitIndex){
        unitIndex = 0
      }
    } catch (e) {}

    try {
      var isLoop = wx.getStorageSync('EngWordsLoop') //是否循环播放（每词循环播放3遍）
      if (!isLoop) {
        isLoop = false
      }
    } catch (e) { }

    try {
      var isSpellwords = wx.getStorageSync('EngWordsSpellwords') //是否 拼读 + 整读
      if (!isSpellwords) {
        isSpellwords = false
      }
    } catch (e) { }

    try {
      var activeData = wx.getStorageSync('EngWordsActiveData') //当前单词
      if (!activeData) {
        activeData = 0
      }
    } catch (e) { }

    this.setData({
      unitIndex: unitIndex, //当前单元 
      isLoop: isLoop, //是否循环播放（每词循环播放N遍）
      isSpellwords: isSpellwords, //是否 拼读 + 整读
      activeData: activeData //当前单词
    })

    // 加载章节
    this.funLoadUnit()

    
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 设置保持常亮状态，IOS当前页中断返回后，需要重设
    wx.setKeepScreenOn({
      keepScreenOn: true
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    if (this.data.isPlay) {
      this.bindPause() //调用暂停点击事件
    }
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    if(this.data.isPlay){
      this.bindPause() //调用暂停点击事件
    }
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

  },
  /**
   * 加载单元
   */
  funLoadUnit: function() {

    var unitNum = Math.ceil(wordsTotal / wordsPerUnit)
    var unit = []
    for (var i = 0; i < unitNum; i++) {
      if (i < (unitNum - 1)) {
        unit.push('Part_' + (i + 1) + ' Words ' + parseInt((i * wordsPerUnit) + 1) + '-' + parseInt((i + 1) * wordsPerUnit))
      } else {
        unit.push('Part_' + (i + 1) + ' Words ' + parseInt((i * wordsPerUnit) + 1) + '-' + wordsTotal)
      }

    }

    this.setData({
      unit: unit
    })

    // 加载数据
    this.funLoadListData()

  },
  /**
   * 加载数据
   */
  funLoadListData: function() {
    var _this = this
    // 获取列表数据
    wx.showNavigationBarLoading(); //在当前页面显示导航条加载动画
    wx.request({
      url: app.globalData.apiUrl + 'knowledge/getUnitWords',
      method: "POST",
      data: {
        unit: _this.data.unitIndex, //当前单元
        limit: wordsPerUnit, //每单元单词数（记录数）
      },
      success: function(res) {
        console.log(res.data)

        if (res.data.code == 0) {
          _this.setData({
            listData: res.data.data
          })
        }
      },
      complete: function(res) {
        wx.hideNavigationBarLoading() //隐藏导航条加载动画
      }
    })


  },
  /**
   * 播放音频
   */
  funPlayAudio: function() {
    var _this = this

    innerAudioContext = wx.createInnerAudioContext() // 实例化 音频播放器
    innerAudioContext.autoplay = true //自动播放
    if (_this.data.isSpellwords) {
      innerAudioContext.src = 'http://hw.hgznedu.com/Words/spellwords/' + _this.data.listData[_this.data.activeData].sew_mp3 + '.mp3' //音频src: 拼读+整读
    } else {
      innerAudioContext.src = 'http://hw.hgznedu.com/Words/words/' + _this.data.listData[_this.data.activeData].sew_mp3 + '.mp3' //音频src: 仅单词
    }

    if (_this.data.isPlay) {
      // 播放自然结束监听
      innerAudioContext.onEnded(() => {
        innerAudioContext.destroy() //播放结束，销毁该实例
        if (_this.data.isLoop) {
          if (repeat > 1) {
            repeat--
          } else {
            repeat = 3
          }
        } else {
          repeat = 1
        }


        if (_this.data.activeData < (wordsPerUnit - 1)) {
          if (_this.data.isPlay && (repeat == 1)) {
            //非暂停状态时，才加载下一词
            _this.setData({
              activeData: _this.data.activeData + 1
            })

            // 写本地缓存（下次进入直接应用）
            try {
              wx.setStorageSync('EngWordsActiveData', this.data.activeData)
            } catch (e) { }
          }

        } else {
          // 所有词加载完毕，重新加载第一个
          _this.setData({
            activeData: 0
          })

          // 写本地缓存（下次进入直接应用）
          try {
            wx.setStorageSync('EngWordsActiveData', 0)
          } catch (e) { }
        }

        _this.funPlayAudio() //自调用继续播放
      })

    } else {
      innerAudioContext.pause() //暂停
    }


  },
  /**
   * 单元选择
   */
  bindPickerChange: function(e) {
    this.setData({
      unitIndex: e.detail.value
    })


    // 写本地缓存（下次进入直接应用）
    try {
      wx.setStorageSync('EngWordsUnitIndex', this.data.unitIndex)
    } catch (e) { }
  },
  /**
   * 播放按钮点击事件
   */
  bindPlay: function() {
    this.setData({
      isPlay: true
    })

    this.funPlayAudio() //播放音频

  },
  /**
   * 暂停按钮点击事件
   */
  bindPause: function() {
    if(this.data.isPlay){
      this.setData({
        isPlay: false
      })

      innerAudioContext.pause() //暂停
    }
    

  },
  /**
   * 循环播入按钮点击事件
   */
  bindLoop: function() {
    var title = '每词朗读3遍'
    repeat = 3
    if (this.data.isLoop) {
      title = '每词朗读1遍'
      repeat = 1
    }
    wx.showToast({
      title: title,
      icon: 'none'
    })

    this.setData({
      isLoop: !(this.data.isLoop)
    })

    // 写本地缓存（下次进入直接应用）
    try {
      wx.setStorageSync('EngWordsLoop', this.data.isLoop)
    } catch (e) { }
  },
  /**
   * 拼读+整读/整读按钮点击事件
   */
  bindSpell: function() {
    var title = '拼读 + 整读'
    if (this.data.isSpellwords) {
      title = '仅整读'
    }
    wx.showToast({
      title: title,
      icon: 'none'
    })

    this.setData({
      isSpellwords: !(this.data.isSpellwords)
    })

    // 写本地缓存（下次进入直接应用）
    try {
      wx.setStorageSync('EngWordsSpellwords', this.data.isSpellwords)
    } catch (e) { }

  }

})