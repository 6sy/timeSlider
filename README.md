### Introduce:
video-time-slider是一个基于原生js打造的视频回放时间轴组件，本组件适用于任何框架。
![image text](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f928d0c8141c4f78b0b893f27f1d566e~tplv-k3u1fbpfcp-watermark.image?)
### demonstration
在线演示地址：[https://6sy.github.io/](https://6sy.github.io/)
挂载在github上，可能有时候访问慢。
### 调试
```
npm i
npm run dev
```
### Install:
```
npm install video-time-slider --save
```
### Usage:
```
const timeSliderInstance = initTimeSlider(el,config)
```
#### React Hook:
```tsx
import {useEffect} from 'react';
import initTimeSlider from 'video-time-slider';
function App() {
  useEffect(()=>{
    initTimeSlider('#timeSlider',{
      curDaytimeChunkArray:['012200-023000-C','002200-003000-B','001200-002000-A','000000-001000-A'], // 时间段
      presentSeconds:20,// 当天开始播放秒数
      timeChunkType:{ // 时间段类型
        A:'red',
        B:'yellow',
        C:'blue'
      },
      speed:1, // 速度
      isInitialPlay:true, // 是否初始化后进行播放
     })
  })
  return (
    <>
     <div id='timeSlider'></div>
    </>
  );
}
export default App;
```
#### Vue3:
```vue
<script setup lang="ts">
import initTimeSlider from 'video-time-slider';
import { nextTick } from 'vue';
nextTick(()=>{
  initTimeSlider('#timeSlider',{
      curDaytimeChunkArray:['012200-023000-C','002200-003000-B','001200-002000-A','000000-001000-A'],
      presentSeconds:20,
      timeChunkType:{
        A:'red',
        B:'yellow',
        C:'blue'
      },
      speed:1,
      isInitialPlay:true,
  })
})
</script>
<template>
   <div id='timeSlider'></div>
</template>
```
#### Script:
```js
<script src="../dist/main.js"></script>
<script>
initTimeSlider('#timeSlider',{
  curDaytimeChunkArray:['012200-023000-C','002200-003000-B','001200-002000-A','000000-001000-A'],
  presentSeconds:20,
  timeChunkType:{
    A:'red',
    B:'yellow',
    C:'blue'
  },
  speed:1,
  isInitialPlay:true,
 })
</script>
```
### config：
|参数|描述|类型|可选值|默认值|
|:--|:--:|:--:|:--:|--:|
|curDaytimeChunkArray|当天的时间块,每一项格式为`startTime-endTime-type`|Array|必填| --|
|presentSeconds|开始播放时间,这个时间为秒数，而且必须在curDaytimeChunkArray时间段内|number| 必填| --|
|timeChunkType|时间段类型,属性名为类型与curDaytimeChunkArray对应，属性值为渲染到时间轴上的颜色|object|必填 | --|
|speed|时间线滚动的速率|number| --| 1|
|isInitialPlay|是否初始化后进行播放,如果设置为false,可以调用实例的timeLinePlay进行播放|boolean| --| false|
|onClick|时间轴点击回调事件|functon||接受两个参数，第一个参数是点击前的时间，第二个参数是点击后的时间|
|onMove|时间轴开始拖动回调事件|function|||
|onMouseDown|时间轴mousedown回调事件|function|||
### Method(instance):

#### timeLinePlay 
开始播放
#### timeLineStop
停止播放

#### setTimeLineLeft
外部控制时间线移动时调用。
```
instance.presentSeconds = 30; // 设置时间线的时间
instance.setTimeLineLeft()   // 设置时间线的位置
```



### 版本 1.0.0
- 第一版本
- 支持时间轴精度调整
- 支持时间线滚动跳动以及判断时间线移动的移动位置的合理性
- 支持以时间线为中心进行缩放时间轴
- 支持不同类型的时间段
- 支持时间轴的点击和拖动

### 版本 1.1.0
- 新增鼠标滑动辅助时间线展示。
- 支持点击，滑动，mousedown事件监听。
- 修复点击事件后，时间轴左移问题。



