import CommonUtils from './commonUtils'
import timeChunk from './timeChunk'
const CONFIG = {
  precisionSetting:{
    10: 8640, // 10s
    60: 1440, // 1min
    300: 288, // 5min
    600: 144, // 10min
    1800: 48, // 30min
    3600: 24, // 1h
  },
  wheelIndexMap:[3600, 1800, 600, 300, 60, 10],
  speed:1, // 速度
}
/**
 * 时间轴组件类
 * @param {el} 元素选择器
 * @param {config} 配置参数
 */
class timeSlider extends CommonUtils {
  constructor(el,config = {}){
    super();
    this.el = el;
    this.PRECISION =  3600 // 最小精度
    this.DAYSECONDS = 60*60*24 // 一天的秒数
    this.PADDINGLEFT = 20 // 根元素的padding值
    this.precisionSetting = CONFIG.precisionSetting // 精度对应参数
    
    // 初始化dom元素
    this.initDomInfo();
    // 初始化事件监听
    this.initRootDomEvent()
    // 初始化时间轴
    this.initTimeAxisDom(this.PRECISION)
    this.timeChunkType = config.timeChunkType
    // 交互相关
    this.isMouseDown = false // 是否按下鼠标了
    this.startX = null; // 开始坐标
    this.startLeft = null; // 开始left距离
    this.startMouseDownTime = null; // 开始按下鼠标时间
    this.wheelIndex = 0; // 时间轴缩放精度值的索引
    this.wheelIndexMap = CONFIG.wheelIndexMap; // 精度时间的集合
    this.speed = config.speed || CONFIG.speed; // 倍速

    this.timer = null ; // 定时器，测试用
    this.curPlayTimeChunk = [] // 目前播放的时间块 0->开始时间 1->结束时间 2->时间块的索引

    // 长度相关
    this.axisLength = null;
    this.allAxisLength = null;

    this.presentSeconds = config.presentSeconds || 0;  // 当前时间(s)
    this.timeNow = ''; // 当前时间字符串
    this.timeLineOutClient = false; // 时间线是否超出屏幕了
    this.isValidMove = true; // 是否为有效的移动
    this.curDaytimeChunkArray =config.curDaytimeChunkArray || []  // '001201-031236-A' 当天的时间块
    this.timeChunkArray = this.curDaytimeChunkArray; // 当前展示的时间块
    this.isInitialPlay = config.isInitialPlay || false
    this.initAxis()
    this.initTimeChunk()

    // 模拟播放条件
    if(config.presentSeconds && this.curDaytimeChunkArray.length){
      // 找出当前时间所在的时间块
      for(let i=0;i<this.curDaytimeChunkArray.length;i++){
        // 解析时间块的时间
        let timeData = this.curDaytimeChunkArray[i].split('-');
        let startTime = timeData[0];
        let endTime = timeData[1];
        if(this.presentSeconds>=startTime && this.presentSeconds<=endTime){
          this.curPlayTimeChunk = [startTime,endTime,i];
          this.isInitialPlay && this.timeLinePlay();
          break;
        }
      }
    }
  }
  // 重新初始化时间轴精度
  initAxis(flag){
      // todo
      if(this.timeChunkArray.length === 0){
        // document.getElementsByClassName('ts-line')[0].style.display = 'none';
        this.timeLineDom = null;
        // document.getElementsByClassName('ts-timeChunk')[0].style.display = 'none';
      }else{
        this.initTimeAxisDom(this.wheelIndexMap[this.wheelIndex])
        this.calTimeSlider()
        !flag && this.setTimeLineLeft()
        // 时间块
        this.initTimeChunk()
      }
  }
  // 初始化时间块 
  initTimeChunk () {
    this.timeChunkArray.forEach((item, index) => {
      let dom = new timeChunk(item).createDom(this.allAxisLength,this.timeChunkType)
      this.containerDom.appendChild(dom)
    })
  }
  // 初始化dom信息
  initDomInfo(){
    this.rootDom = this.getDomInstanceUtils(this.el);
    // 创建容器元素
    let containerDiv = document.createElement('div');
    containerDiv.classList.add('ts-container');
    this.rootDom.appendChild(containerDiv);
    this.containerDom = containerDiv
    // 初始化时间线
    let div = document.createElement('div')
    let span = document.createElement('span')


    div.classList.add('ts-line')
    span.classList.add('ts-line-present')
    span.innerHTML='00:00:00'
    div.appendChild(span)
    this.rootDom.appendChild(div)
    this.timeLinePresentDom = span
    this.timeLineDom = div

  }
  initRootDomEvent () {
    let that = this
    // 鼠标滑动时间轴
    this.rootDom.addEventListener('mousedown', e => {
      that.isMouseDown = true;
      that.startX = e.offsetX;
      this.startLeft = that.domLeftToNumberUtils(that.containerDom);
      this.startMouseDownTime = new Date().getTime()
      this.rootDom.classList.add('ts-move')
      this.isValidMove =true;
    })
    this.rootDom.addEventListener('mousemove', e => {
      if (that.isMouseDown && this.precision !== 3600) {
        let offsetX = e.offsetX - this.startX;
        let isDragToLeft = offsetX<0
        let isDragToRight = offsetX>0
        // 滚动到临界值
        let isRightOver = (this.allAxisLength+that.containerDom.offsetLeft)<20+this.rootDom.offsetWidth
        if (this.startLeft + offsetX > 20 && isDragToRight) {
          that.containerDom.style.left =0 + 'px'
          this.isValidMove =false;
          return
        }else if(isRightOver && isDragToLeft){
          that.containerDom.style.left = -this.allAxisLength + this.rootDom.offsetWidth -35+'px'
          this.isValidMove =false;
          return;
        }
        that.containerDom.style.left = -20+this.startLeft + offsetX + 'px'
      }
    })
    this.rootDom.addEventListener('mouseup', e => {
      let oldPresentSeconds = this.presentSeconds
      // 处理点击事件
      if (new Date().getTime() - that.startMouseDownTime < 300) {
        console.log('点击',e.offsetX)
        this.handleClick(e.offsetX)
      } else {
        // 计算当前时间
        this.calCurPreseconds(e.offsetX-this.startX-this.PADDINGLEFT)
      }
      console.log('时间差', new Date().getTime() - that.startMouseDownTime)
      that.isMouseDown = false;
      this.rootDom.classList.remove('ts-move')
      // 校验当前位置
      if(this.verifyTimeLineSite(oldPresentSeconds)){
        console.log('不合理')
        return;
      }else{
        this.timeLinePlay()
      }
    })
    this.rootDom.addEventListener('mouseout', e => {
      that.isMouseDown = false;

      this.rootDom.classList.remove('ts-move')

    })

    // 鼠标滑动进行缩放
    this.rootDom.addEventListener('mousewheel', e => {
      let oldAllAxisLength = that.allAxisLength
      let oldTimeLineLeft = this.domLeftToNumberUtils(this.timeLineDom)
      if (e.wheelDelta > 0) {
        if (that.wheelIndex < that.wheelIndexMap.length - 1) {
          ++that.wheelIndex
          that.precision = that.wheelIndexMap[that.wheelIndex]
           //重新初始化
      that.initAxis(true)
      this.zoomSetTimeSlider(oldAllAxisLength,oldTimeLineLeft,that.allAxisLength,true)
        }
      } else {
        if (that.wheelIndex > 0) {
          --that.wheelIndex;
          that.precision = that.wheelIndexMap[that.wheelIndex]
           //重新初始化
      that.initAxis(true)
      this.zoomSetTimeSlider(oldAllAxisLength,oldTimeLineLeft,that.allAxisLength,false)
        }
      }
      
     
      // 精度为1小时需要设置left
      if(that.precision === 3600){
        this.containerDom.style.left = 0
      }
      // 判断时间轴left值不能大于0
      if(that.containerDom.offsetLeft>=0){
        that.containerDom.style.left = 0;
      }
      // 以及right值 大于0需要归0
      if(this.allAxisLength+this.rootDom.offsetLeft<=document.body.clientWidth){
        this.rootDom.style.left = -this.allAxisLength+document.body.clientWidth-2*this.paddingLeft+'px';
      }
      this.setTimeLineLeft()
    })

  }
  /**
   * 处理点击事件
   * @param {number} left 鼠标点击时offsetX的值 
   */
   handleClick(left){
    this.presentSeconds = (-this.domLeftToNumberUtils(this.containerDom)+left-this.PADDINGLEFT)*this.DAYSECONDS /  this.allAxisLength
    // this.setCurTimeChunk()
    console.log('点击时间',this.presentSeconds)
    this.setTimeLineLeft()
   }
   /**
    * 检验时间线移动后的位置
    * @param {number} oldPresentSeconds 移动前的时间
    * @returns {undefined | true} 
    */
   verifyTimeLineSite(oldPresentSeconds){
    if(!this.timeChunkArray.length){
      return;
    }
    // 当前位置没有录像
    let isInTimeChunk =false; // 是否再
    let isInLastRight = this.presentSeconds>this.getTimeChunkLastEndTime()
    for(let i =0;i<this.timeChunkArray.length;i++){
      let timeArr = this.timeChunkArray[i].split('-')
      let startTimeSecond = this.timeTranslateSecondsUtils(timeArr[0])
      let endTimeSecond = this.timeTranslateSecondsUtils(timeArr[1])
      if(startTimeSecond<=this.presentSeconds && this.presentSeconds<=endTimeSecond){
        isInTimeChunk = true;
        this.curPlayTimeChunk[0] = startTimeSecond
        this.curPlayTimeChunk[1] = endTimeSecond
        this.curPlayTimeChunk[2] =i
        break;
      }
    }
    // 判断当前时间有录像
    if(isInTimeChunk){
      return
    }
    // 获取下一段录像
    if(!isInLastRight){
      for(let i =0;i<this.timeChunkArray.length;i++){
        let timeArr = this.timeChunkArray[i].split('-')
        let timeNextArr,nextEndTimeSecond
        let startTimeSecond = this.timeTranslateSecondsUtils(timeArr[0])
        let endTimeSecond = this.timeTranslateSecondsUtils(timeArr[1])
        if(i+1>=this.timeChunkArray.length){
          nextEndTimeSecond = 0;
        }else{
          timeNextArr = this.timeChunkArray[i+1].split('-')
          nextEndTimeSecond = this.timeTranslateSecondsUtils(timeNextArr[1])
        }
        if(nextEndTimeSecond<this.presentSeconds && this.presentSeconds<startTimeSecond){
          this.presentSeconds = startTimeSecond
          this.curPlayTimeChunk[0] = startTimeSecond
          this.curPlayTimeChunk[1] = endTimeSecond
          this.curPlayTimeChunk[2] =i
          break;
        }
      }
    }else{
      // 无法获取最后一段时间
      this.presentSeconds = oldPresentSeconds
      this.setTimeLineLeft()
      return true;
    }
    this.setTimeLineLeft()
  }
   // 拖拽后 计算当前时间
   calCurPreseconds(x){
    this.presentSeconds = -x*60*60*24/this.allAxisLength+this.presentSeconds
  }
  /**
 * 获取长度
 @param {number} precision 精度大小 1|5|10|30|60
 */
 calTimeSlider () {
  let axisDom = this.getDomInstanceUtils('.ts-axis')
  this.axisLength = axisDom.offsetWidth
  this.allAxisLength = axisDom.offsetWidth * this.precisionSetting[this.wheelIndexMap[this.wheelIndex]]
  console.log('总长度', this.allAxisLength)
  console.log('单个长度', this.axisLength)
}
  /**
  * 时间轴dom的展示
  @param {number} precision 精度大小 1|5|10|30|60
  */
  initTimeAxisDom (precision) {
    this.containerDom.innerHTML = ''
    const axisNum = this.precisionSetting[precision] // 获取轴的数量
    for (let i = 0; i < axisNum; i++) {
      let div = document.createElement('div')
      div.classList.add('ts-axis')
      // 特殊轴的处理 最后一轴
      if (i === axisNum - 1) {
        div.classList.add('ts-axis-last')
        let span = document.createElement('span')
        span.classList.add('ts-axis-time-last')
        span.innerText = `24:00`
        div.appendChild(span);

      }

      if (i % (2) === 0 && axisNum === 24) {
        let span = document.createElement('span')
        span.classList.add('ts-axis-time')
        span.innerText = `${i >= 10 ? i : '0' + i}:00`
        div.appendChild(span);
      }
      if (axisNum === 48) {
        let span = document.createElement('span')
        span.classList.add('ts-axis-time')
        let min = i % 2
        let hour = Math.floor(i / 2)
        span.innerText = `${hour >= 10 ? hour : '0' + hour}:${min ? '30' : '00'}`
        div.appendChild(span);
      }

      if (axisNum === 144) {
        let span = document.createElement('span')
        span.classList.add('ts-axis-time')
        let time = i * 10;
        let min = (time) % 60
        let hour = (time - min) / 60
        span.innerText = `${hour >= 10 ? hour : '0' + hour}:${min >= 10 ? min : '0' + min}`
        div.appendChild(span);
      }

      if (axisNum === 288) {
        let span = document.createElement('span')
        span.classList.add('ts-axis-time')
        let time = i * 5;
        let min = (time) % 60
        let hour = (time - min) / 60
        span.innerText = `${hour >= 10 ? hour : '0' + hour}:${min >= 10 ? min : '0' + min}`
        div.appendChild(span);
      }

      if (axisNum === 1440) {
        let span = document.createElement('span')
        span.classList.add('ts-axis-time')
        let time = i * 1;
        let min = (time) % 60
        let hour = (time - min) / 60
        span.innerText = `${hour >= 10 ? hour : '0' + hour}:${min >= 10 ? min : '0' + min}`
        div.appendChild(span);
      }

      if (i % (6) === 0 && axisNum === 8640) {
        let span = document.createElement('span')
        span.classList.add('ts-axis-time')

        let time = i * 10;
        let min = (((time / 60) % 60))

        let hour = Math.floor((time / 60 / 60)).toFixed(2) * 100 / 100
        console.log(time, hour)
        span.innerText = `${hour >= 10 ? hour : '0' + hour}:${min >= 10 ? min : '0' + min}`
        div.appendChild(span);
      }

      div.classList.add('ts-axis-60')
      this.containerDom.appendChild(div)
    }
  }
  /**
   * 设置时间线的位置
   */
   setTimeLineLeft () {
    let left = (this.presentSeconds) * (this.allAxisLength / this.DAYSECONDS)
    left =(left +this.domLeftToNumberUtils(this.containerDom))
    this.timeLineDom.style.left = this.PADDINGLEFT+left + 'px'
  }
   /**
   * 缩放的时候，以时间线为中心进行，时间线相对位置不变
   * @param {number}  oldAxisLength 旧的时间轴长度
   * @param {number}  oldTimeLineLeft 旧的时间线left长度
   * @param {number}  newAxisLength 新的时间轴长度
   */
    zoomSetTimeSlider(oldAxisLength,oldTimeLineLeft,newAxisLength){
      let curRootDomLeft = this.domLeftToNumberUtils(this.containerDom)
      let left = (oldTimeLineLeft-this.PADDINGLEFT-curRootDomLeft)/oldAxisLength*newAxisLength-(oldTimeLineLeft-this.PADDINGLEFT)
      this.containerDom.style.left = -left+'px'
    }
    /**
     * 测试模拟时间线停止移动
     */
    timeLineStop(){
      clearInterval(this.timer)
      this.timer = null;
     /**
     * 测试模拟时间线开始移动
     */
    }
    timeLinePlay () {
      if(this.timer){
        return;
      }
      this.timer =setInterval(()=>{
      this.presentSeconds = this.presentSeconds + this.speed
      // 拖动的时候指针不滚动
      if(this.isMouseDown){
        return
      }
      let left = this.speed * (this.allAxisLength / this.DAYSECONDS) + this.domLeftToNumberUtils(this.timeLineDom)
      this.setTimeLineLeft()
      
      if(this.containerDom.offsetWidth<left){
        console.log('playback isRightOver')
        this.isRightOver = true;
      }else{
        this.isRightOver = false;
      }
      this.timeNow = this.secondsTranslateTimeUtils(this.presentSeconds);
      this.timeLinePresentDom.innerText = this.timeNow
      // 当段录像播放完毕  兼容处理'174252-174656-A', '173952-174253-A'
      // +2为了临界值的判断
      if(this.presentSeconds+1 >= this.curPlayTimeChunk[1]){
        console.log('临界判断')
        let index = this.curPlayTimeChunk[2] -1;
        if(index<0){
          this.presentSeconds = this.presentSeconds + this.speed
          this.setTimeLineLeft()
          this.timeLineStop()
          this.playbackState = 0;
          return;
        }
        let timeArr = this.timeChunkArray[index].split('-')
        let startTimeSecond = this.timeTranslateSecondsUtils(timeArr[0])
        let endTimeSecond = this.timeTranslateSecondsUtils(timeArr[1])
        this.presentSeconds = startTimeSecond;
        this.curPlayTimeChunk[0] = startTimeSecond
        this.curPlayTimeChunk[1] = endTimeSecond
        this.curPlayTimeChunk[2] = index;
        this.playbackState = 0;
        this.setTimeLineLeft()
        this.timeNow = this.secondsTranslateTimeUtils(this.presentSeconds);
        this.timeLinePresentDom.innerText = this.timeNow
      }
      },1000)
      
  }
  /**
   * 获取时间块最后一段的结束时间
   */
   getTimeChunkLastEndTime(){
    return this.timeTranslateSecondsUtils(this.timeChunkArray[0] && this.timeChunkArray[0].split('-')[1])
  }
  /**
   * 获取时间块的第一段的开始时间
   */
  getTimeChunkFirstStartTime(){
    return this.timeTranslateSecondsUtils(this.timeChunkArray[this.timeChunkArray.length-1] && this.timeChunkArray[this.timeChunkArray.length-1].split('-')[0])
  }
   /**
   * 获取时间块的第一段的结束时间
   */
    getTimeChunkFirstEndTime(){
      return this.timeTranslateSecondsUtils(this.timeChunkArray[this.timeChunkArray.length-1] && this.timeChunkArray[this.timeChunkArray.length-1].split('-')[1])
    }
}


export default timeSlider
