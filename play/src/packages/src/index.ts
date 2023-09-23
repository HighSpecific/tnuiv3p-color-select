import { withNoopInstall } from '@tuniao/tnui-vue3-uniapp/utils'
import ColorSelect from './index.vue'

export const TnColorSelect = withNoopInstall(ColorSelect)
export default TnColorSelect

export * from './types'
export type { TnColorSelectInstance } from './instance'
