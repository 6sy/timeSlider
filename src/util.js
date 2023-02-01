// 公共函数类
class CommonUtils {
  /**
 * 时间格式转换成秒 '001010'->610
 @param {seconds} 当前时间秒数
 */
  timeTranslateSeconds(seconds) {
    let s = Number(seconds.slice(4))
    let m = Number(seconds.slice(2, 4))
    let h = Number(seconds.slice(0, 2))
    return s + m * 60 + h * 60 * 60
  }
  /**
 * 秒转换成时间格式
 @param {seconds} 当前时间秒数
 */
  secondsTranslateTime(seconds) {
    let h = this.timeFormat(Math.floor(seconds / 60 / 60))
    let m = this.timeFormat(Math.floor((seconds - h * 60 * 60) / 60))
    let s = this.timeFormat(Math.floor(seconds % 60))
    return `${h}:${m}:${s}`
  }
  /**
* 时间展示格式转换 '1'->'01'
@param {num} 时间
*/
  timeFormat(num) {
    return num >= 10 ? num : '0' + num
  }
  /**
* 获取dom实例
@param {string} selector dom选择器
*/
  getDomInstance(selector) {
    return document.querySelector(selector)
  }
  /**
 *获取domleft距离装换成number 2px->2(offsetLeft精确度不够)
@param {string} dom :dom元素
*/
  domLeftToNumber(dom) {
    return dom && Number(dom.style.left.split('px')[0])
  }
}

export default CommonUtils
