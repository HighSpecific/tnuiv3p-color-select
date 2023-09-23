import { computed, nextTick, ref, watch } from 'vue'
import { debugWarn } from '@tuniao/tnui-vue3-uniapp/utils'
import {
  CHANGE_EVENT,
  UPDATE_MODEL_EVENT,
} from '@tuniao/tnui-vue3-uniapp/constants'
import { useFormItem } from '@tuniao/tnui-vue3-uniapp/components/form'
import ConversionColor from '../utils/conversion-color'
import { useColorSelectPancelHandle } from './use-color-select-panel-handle'

import type { SetupContext } from 'vue'
import type { ConversionColorType } from '../utils/conversion-color/interface'
import type { ColorSelectEmits, ColorSelectProps } from '../types'

type SelectDefaultColorType = (defaultValue: string) => string

export const useColorSelect = (
  props: ColorSelectProps,
  emits: SetupContext<ColorSelectEmits>['emit']
) => {
  const { formItem } = useFormItem()
  // 颜色转换对象
  const colorConversion = ref<ConversionColor | null>(null)

  // 饱和度 0 ~ 1
  const saturation = ref<number>(1)
  // 亮度 0 ~ 1
  const brightness = ref<number>(1)
  // 透明度 0 ~ 1
  const alpha = ref<number>(1)
  // 色调 0 ~ 360deg
  const hue = ref<number>(0)

  // 如果饱和度、亮度、透明度、色调发生变化，更新颜色转换对象
  watch(
    () => [saturation, brightness, alpha, hue],
    () => {
      colorConversion.value = new ConversionColor(
        `hsva(${hue.value}, ${saturation.value}, ${brightness.value}, ${alpha.value})`
      )
    },
    {
      immediate: true,
      deep: true,
    }
  )

  // 颜色值的格式
  const colorFormmat = ref<ConversionColorType.ColorFormats.FORMATS>('hex')

  // 可选格式的值
  const formatValues: ConversionColorType.ColorFormats.FORMATS[] = [
    'hex',
    'rgb',
    'hsl',
    'hsv',
  ]

  let updateInner = false
  // 当前选中的颜色
  const currentSelectColor = computed<string>(() =>
    (colorConversion.value?.toHexString(false) || '').toLocaleLowerCase()
  )
  const currentSelectColorWithDefault = computed<SelectDefaultColorType>(() => {
    return (defaultValue: string) => {
      const color = currentSelectColor.value
      return color ? color : defaultValue
    }
  })
  // 用户选中的颜色
  const previewColor = ref(props.modelValue || '#FF0000')

  // 根据不同的类型生成对应的颜色的值
  const colorValue = computed<string>(() => {
    let color = ''
    if (currentSelectColor.value) {
      switch (colorFormmat.value) {
        case 'hex':
          color =
            (alpha.value === 1
              ? colorConversion.value?.toHexString(false)
              : colorConversion.value?.toHex8String(false)) || ''
          color = color.toLocaleUpperCase()
          break
        case 'rgb':
          color = colorConversion.value?.toRGBString() || ''
          break
        case 'hsl':
          color = colorConversion.value?.toHslString() || ''
          break
        case 'hsv':
          color = colorConversion.value?.toHsvString() || ''
          break
      }
    }
    return color
  })

  // 是否使用暗色背景
  const useDarkBg = computed<boolean>(
    () => brightness.value < 0.5 || alpha.value < 0.5
  )
  const previewDarkBg = ref<boolean>()
  watch(
    () => useDarkBg.value,
    (val) => {
      if (!previewDarkBg.value) {
        previewDarkBg.value = val
      }
    }
  )

  const {
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
  } = useColorSelectPancelHandle(saturation, brightness, alpha, hue)

  // 颜色选择容器弹框
  const showSelectColorPicker = ref<boolean>(false)
  const openSelectColorPicker = async () => {
    if (props.disabled) return
    showSelectColorPicker.value = true

    setTimeout(() => {
      nextTick(async () => {
        await getContainerCanvasRectInfo()
        initSliderPosition()
      })
    }, 500)
  }
  // setTimeout(() => {
  //   openSelectColorPicker()
  // }, 3000)
  const closeSelectColorPicker = () => {
    showSelectColorPicker.value = false
  }
  const cancelHandle = () => {
    closeSelectColorPicker()
  }
  const confirmHandle = () => {
    updateInner = true
    emits(UPDATE_MODEL_EVENT, colorValue.value)
    emits(CHANGE_EVENT, colorValue.value)
    if (props.validateEvent) {
      formItem?.validate?.('change').catch((err) => {
        debugWarn(err)
      })
    }
    previewColor.value = currentSelectColor.value
    previewDarkBg.value = useDarkBg.value
    closeSelectColorPicker()
  }

  // 切换颜色格式
  const switchColorFormat = () => {
    const index = formatValues.indexOf(colorFormmat.value)
    const nextIndex = index + 1 >= formatValues.length ? 0 : index + 1
    colorFormmat.value = formatValues[nextIndex]
  }

  // 更新颜色信息
  const updateColorInfo = () => {
    // 解析颜色
    try {
      const conversion = new ConversionColor(props.modelValue || '#FF0000')
      const hsvInfo = conversion.toHsv()
      hue.value = hsvInfo.h
      saturation.value = hsvInfo.s
      brightness.value = hsvInfo.v
      alpha.value = hsvInfo.a
      colorFormmat.value = conversion.getFormat()

      if (colorFormmat.value.includes('hex')) {
        colorFormmat.value = 'hex'
      }

      nextTick(() => {
        previewColor.value = colorValue.value
        previewDarkBg.value = useDarkBg.value
      })

      if (!props.modelValue) {
        nextTick(() => {
          setTimeout(() => {
            updateInner = true
            emits(UPDATE_MODEL_EVENT, colorValue.value)
          }, 50)
        })
      }
    } catch (err) {
      debugWarn(
        '[TnColorSelect]',
        '初始化颜色转换对象失败, 请检查颜色值是否正确'
      )
      console.error(err)
    }
  }
  watch(
    () => props.modelValue,
    () => {
      if (updateInner) {
        updateInner = false
        return
      }
      updateColorInfo()
    },
    {
      immediate: true,
    }
  )

  return {
    alphaContainerId,
    hueContainerId,
    saturationCanvasId,
    alpha,
    colorValue,
    previewColor,
    currentSelectColor,
    currentSelectColorWithDefault,
    previewDarkBg,
    useDarkBg,
    alphaSliderPositionInfo,
    hueSliderPositionInfo,
    saturationSliderPositionInfo,
    showSelectColorPicker,
    openSelectColorPicker,
    cancelHandle,
    confirmHandle,
    alphaTouchStartHandle,
    alphaTouchMovingHandle,
    alphaTouchEndHandle,
    hueTouchStartHandle,
    hueTouchMovingHandle,
    hueTouchEndHandle,
    saturationTouchStartHandle,
    saturationTouchMovingHandle,
    saturationTouchEndHandle,
    switchColorFormat,
  }
}
