import { getCurrentInstance, reactive, ref } from 'vue'
import { useSelectorQuery } from '@tuniao/tnui-vue3-uniapp/hooks'
import { debugWarn, generateId } from '@tuniao/tnui-vue3-uniapp/utils'

type RectInfoType = {
  width: number
  height: number
  left: number
  top: number
}

type SliderPositionType = {
  x: number
  y: number
}

export const useContainerRectInfo = () => {
  const instance = getCurrentInstance()

  const { getSelectorNodeInfo } = useSelectorQuery(instance)

  // 透明度容器id
  const alphaContainerId = `tcsa-${generateId()}`
  // 色调容器id
  const hueContainerId = `tcsh-${generateId()}`
  // 饱和度画布id
  const saturationCanvasId = `tcssc-${generateId()}`

  const saturationCanvasCtx = ref<UniApp.CanvasContext>()

  // 透明度滑块信息
  const alphaSliderPositionInfo = reactive<SliderPositionType>({
    x: 0,
    y: 0,
  })
  // 色调滑块信息
  const hueSliderPositionInfo = reactive<SliderPositionType>({
    x: 0,
    y: 0,
  })
  // 饱和度滑块信息
  const saturationSliderPositionInfo = reactive<SliderPositionType>({
    x: 0,
    y: 0,
  })

  // 容器信息
  const alphaContainerRectInfo = reactive<RectInfoType>({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  })
  const hueContainerRectInfo = reactive<RectInfoType>({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  })
  const saturationCanvasRectInfo = reactive<RectInfoType>({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  })
  // 获取容器画布布局信息
  let initCount = 0
  let getRectInfoStatus = false
  const getContainerCanvasRectInfo = async () => {
    if (getRectInfoStatus) return
    try {
      const alphaContainerRect = await getSelectorNodeInfo(
        `#${alphaContainerId}`
      )
      const hueContainerRect = await getSelectorNodeInfo(`#${hueContainerId}`)
      const saturationCanvasRect = await getSelectorNodeInfo(
        `#${saturationCanvasId}`
      )

      alphaContainerRectInfo.width = alphaContainerRect.width || 0
      alphaContainerRectInfo.height = alphaContainerRect.height || 0
      alphaContainerRectInfo.left = alphaContainerRect.left || 0
      alphaContainerRectInfo.top = alphaContainerRect.top || 0

      hueContainerRectInfo.width = hueContainerRect.width || 0
      hueContainerRectInfo.height = hueContainerRect.height || 0
      hueContainerRectInfo.left = hueContainerRect.left || 0
      hueContainerRectInfo.top = hueContainerRect.top || 0

      saturationCanvasRectInfo.width = saturationCanvasRect.width || 0
      saturationCanvasRectInfo.height = saturationCanvasRect.height || 0
      saturationCanvasRectInfo.left = saturationCanvasRect.left || 0
      saturationCanvasRectInfo.top = saturationCanvasRect.top || 0

      saturationCanvasCtx.value = uni.createCanvasContext(
        saturationCanvasId,
        instance
      )

      initCount = 0
      getRectInfoStatus = true
    } catch (err) {
      if (initCount > 10) {
        debugWarn(
          '[TnColorSelect]',
          `获取颜色选择器容器画布布局信息失败：${err}`
        )
        initCount = 0
        getRectInfoStatus = false
        return
      }
      setTimeout(() => {
        getContainerCanvasRectInfo()
        initCount++
      }, 150)
    }
  }

  return {
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
  }
}
