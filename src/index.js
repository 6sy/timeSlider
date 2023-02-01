import timeSlider from './components/timeSlider.js'
import './statics/css/index.css'
/**
 * 时间轴入口函数
 * @returns 返回时间轴组件实例
 */
function initTimeSlider(el, config) {
  return new timeSlider(el, config)
}
window.initTimeSlider = initTimeSlider
export default initTimeSlider
