import {
  CHANGE_EVENT,
  UPDATE_MODEL_EVENT,
} from '@tuniao/tnui-vue3-uniapp/constants'
import { buildProps, isString } from '@tuniao/tnui-vue3-uniapp/utils'

import type { ExtractPropTypes } from 'vue'

export const colorSelectProps = buildProps({
  /**
   * @description 选中的颜色
   */
  modelValue: String,
  /**
   * @description 是否禁用
   */
  disabled: Boolean,
  /**
   * @description 颜色展示框的尺寸，可以传递带单位的值
   */
  size: {
    type: String,
    default: '',
  },
  /**
   * @description 值发生修改时是否触发表单验证
   */
  validateEvent: {
    type: Boolean,
    default: true,
  },
})

export const colorSelectEmits = {
  [UPDATE_MODEL_EVENT]: (value: string) => isString(value),
  [CHANGE_EVENT]: (value: string) => isString(value),
}

export type ColorSelectProps = ExtractPropTypes<typeof colorSelectProps>
export type ColorSelectEmits = typeof colorSelectEmits
