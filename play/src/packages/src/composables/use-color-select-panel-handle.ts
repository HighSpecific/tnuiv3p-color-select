import ConversionColor from '../utils/conversion-color'
import { useContainerRectInfo } from './use-container-rect-info'

import type { Ref } from 'vue'

export const useColorSelectPancelHandle = (
  saturation: Ref<number>,
  brightness: Ref<number>,
  alpha: Ref<number>,
  hue: Ref<number>
) => {
  const {
    alphaContainerId,
    hueContainerId,
    saturationCanvasId,
    saturationCanvasCtx,
    alphaContainerRectInfo,
    hueContainerRectInfo,
    saturationCanvasRectInfo,
    alphaSliderPositionInfo,
    hueSliderPositionInfo,
    saturationSliderPositionInfo,
    getContainerCanvasRectInfo,
  } = useContainerRectInfo()

  // 透明度触摸事件
  let alphaSliderTouching = false
  const alphaTouchStartHandle = (e: TouchEvent) => {
    _updateAlphaSliderValue(e)
    alphaSliderTouching = true
  }
  const alphaTouchMovingHandle = (e: TouchEvent) => {
    if (!alphaSliderTouching) return
    _updateAlphaSliderValue(e)
  }
  const alphaTouchEndHandle = () => {
    alphaSliderTouching = false
  }
  const _updateAlphaSliderValue = (e: TouchEvent) => {
    const touch = _getTouchPointer(e)
    if (!touch) return

    const { pageY } = touch
    const { top: rectTop, height: rectHeight } = alphaContainerRectInfo
    const y = _getSliderPositionY(pageY, rectTop, rectHeight)
    alphaSliderPositionInfo.y = y
    alpha.value = 1 - y / rectHeight
  }

  // 色调触摸事件
  let hueSliderTouching = false
  const hueTouchStartHandle = (e: TouchEvent) => {
    _updateHueSliderValue(e)
    hueSliderTouching = true
  }
  const hueTouchMovingHandle = (e: TouchEvent) => {
    if (!hueSliderTouching) return
    _updateHueSliderValue(e)
  }
  const hueTouchEndHandle = () => {
    hueSliderTouching = false
  }
  const _updateHueSliderValue = (e: TouchEvent) => {
    const touch = _getTouchPointer(e)
    if (!touch) return

    // 重置饱和度、亮度、透明度信息
    _resetSaturationAndBrightness()
    alpha.value = 1
    alphaSliderPositionInfo.y = 0

    const { pageY } = touch
    const { top: rectTop, height: rectHeight } = hueContainerRectInfo
    const y = _getSliderPositionY(pageY, rectTop, rectHeight)
    hueSliderPositionInfo.y = y
    hue.value = (y / rectHeight) * 360
  }

  // 饱和度、亮度触摸事件
  let saturationSliderTouching = false
  const saturationTouchStartHandle = (e: TouchEvent) => {
    _updateSaturationSliderValue(e)
    saturationSliderTouching = true
  }
  const saturationTouchMovingHandle = (e: TouchEvent) => {
    if (!saturationSliderTouching) return
    _updateSaturationSliderValue(e)
  }
  const saturationTouchEndHandle = () => {
    saturationSliderTouching = false
  }
  const _updateSaturationSliderValue = (e: TouchEvent) => {
    const touch = _getTouchPointer(e)
    if (!touch) return

    const { pageX, pageY } = touch
    const {
      left: rectLeft,
      top: rectTop,
      width: rectWidth,
      height: rectHeight,
    } = saturationCanvasRectInfo
    const x = _getSliderPositionX(pageX, rectLeft, rectWidth)
    const y = _getSliderPositionY(pageY, rectTop, rectHeight)

    saturationSliderPositionInfo.x = x
    saturationSliderPositionInfo.y = y

    // 更新饱和度和亮度
    saturation.value = x / rectWidth
    brightness.value = 1 - y / rectHeight
  }

  // 初始化滑块的位置
  const initSliderPosition = () => {
    alphaSliderPositionInfo.x = 0
    alphaSliderPositionInfo.y = 0
    hueSliderPositionInfo.x = 0
    hueSliderPositionInfo.y = 0
    saturationSliderPositionInfo.x = saturationCanvasRectInfo.width
    saturationSliderPositionInfo.y = 0

    if (alpha.value != 1) {
      alphaSliderPositionInfo.y =
        alphaContainerRectInfo.height * (1 - alpha.value)
    }
    if (hue.value != 0) {
      hueSliderPositionInfo.y = hueContainerRectInfo.height * (hue.value / 360)
    }

    if (brightness.value != 1) {
      saturationSliderPositionInfo.y =
        saturationCanvasRectInfo.height * (1 - brightness.value)
    }
    if (saturation.value != 1) {
      saturationSliderPositionInfo.x =
        saturationCanvasRectInfo.width * saturation.value
    }
    _drawSaturationAndBrightnessCanvas()
  }

  // 绘制饱和度和亮度画布
  const _drawSaturationAndBrightnessCanvas = () => {
    if (!saturationCanvasCtx.value) return
    saturationCanvasCtx.value.clearRect(
      0,
      0,
      saturationCanvasRectInfo.width,
      saturationCanvasRectInfo.height
    )
    saturationCanvasCtx.value.fillStyle = new ConversionColor(
      `hsv(${hue.value}, 1, 1)`
    ).toHexString(false)
    saturationCanvasCtx.value.fillRect(
      0,
      0,
      saturationCanvasRectInfo.width,
      saturationCanvasRectInfo.height
    )

    const whiteGradient = saturationCanvasCtx.value.createLinearGradient(
      0,
      0,
      saturationCanvasRectInfo.width,
      0
    )
    whiteGradient.addColorStop(0, '#FFF')
    whiteGradient.addColorStop(1, 'transparent')
    saturationCanvasCtx.value.setFillStyle(whiteGradient)
    saturationCanvasCtx.value.fillRect(
      0,
      0,
      saturationCanvasRectInfo.width,
      saturationCanvasRectInfo.height
    )

    const blackGradient = saturationCanvasCtx.value.createLinearGradient(
      0,
      0,
      0,
      saturationCanvasRectInfo.height
    )
    blackGradient.addColorStop(0, 'transparent')
    blackGradient.addColorStop(1, '#000')
    saturationCanvasCtx.value.setFillStyle(blackGradient)
    saturationCanvasCtx.value.fillRect(
      0,
      0,
      saturationCanvasRectInfo.width,
      saturationCanvasRectInfo.height
    )

    saturationCanvasCtx.value.draw(false)
  }

  // 重置饱和度和亮度信息
  const _resetSaturationAndBrightness = () => {
    saturationSliderPositionInfo.x = saturationCanvasRectInfo.width
    saturationSliderPositionInfo.y = 0
    saturation.value = 1
    brightness.value = 1
    _drawSaturationAndBrightnessCanvas()
  }

  // 获取触摸点
  const _getTouchPointer = (e: TouchEvent): Touch | null => {
    const touches = e.changedTouches || e.touches
    const touch = touches[0]
    if (!touch) return null
    return touch
  }

  // 获取滑块y轴位置
  const _getSliderPositionY = (
    touchY: number,
    containerTop: number,
    containerHeight: number
  ): number => {
    let y = touchY - containerTop
    if (y < 0) y = 0
    if (y > containerHeight) y = containerHeight
    return y
  }
  // 获取滑块x轴位置
  const _getSliderPositionX = (
    touchX: number,
    containerLeft: number,
    containerWidth: number
  ): number => {
    let x = touchX - containerLeft
    if (x < 0) x = 0
    if (x > containerWidth) x = containerWidth
    return x
  }

  return {
    alphaContainerId,
    hueContainerId,
    saturationCanvasId,
    alphaSliderPositionInfo,
    hueSliderPositionInfo,
    saturationSliderPositionInfo,
    alphaTouchStartHandle,
    alphaTouchMovingHandle,
    alphaTouchEndHandle,
    hueTouchStartHandle,
    hueTouchMovingHandle,
    hueTouchEndHandle,
    saturationTouchStartHandle,
    saturationTouchMovingHandle,
    saturationTouchEndHandle,
    getContainerCanvasRectInfo,
    initSliderPosition,
  }
}
