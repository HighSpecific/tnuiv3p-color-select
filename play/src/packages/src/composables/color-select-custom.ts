import { computed } from 'vue'
import { useComponentSize, useNamespace } from '@tuniao/tnui-vue3-uniapp/hooks'
import { formatDomSizeValue } from '@tuniao/tnui-vue3-uniapp/utils'

import type { CSSProperties } from 'vue'
import type { ColorSelectProps } from '../types'

export const useColorSelectCustomStyle = (props: ColorSelectProps) => {
  const ns = useNamespace('color-select')

  const { sizeType } = useComponentSize(props.size)

  const colorSelectClass = computed<string>(() => {
    const cls: string[] = [ns.b(), ns.is('disabled', props.disabled)]

    if (sizeType.value === 'inner') {
      cls.push(ns.m(props.size))
    }

    return cls.join(' ')
  })
  const colorSelectStyle = computed<CSSProperties>(() => {
    const style: CSSProperties = {}

    if (sizeType.value === 'custom') {
      style.width = formatDomSizeValue(props.size)
      style.height = style.width
      style.fontSize = `calc(${style.width} * (2 / 3))`
    }

    return style
  })

  return {
    ns,
    colorSelectClass,
    colorSelectStyle,
  }
}
