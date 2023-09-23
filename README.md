# 图鸟 UI vue3 uniapp Plugins

![TuniaoUI vue3 uniapp](https://resource.tuniaokj.com/images/vue3/market/vue3-banner-min.jpg 'TuniaoUI vue3 uniapp')

[Tuniao UI vue3官方仓库](https://github.com/tuniaoTech/tuniaoui-rc-vue3-uniapp)

该组件用于选择颜色

## 组件安装

```bash
npm i tnuiv3p-tn-color-select
```

## 组件位置

```typescript
import TnSelect from 'tnuiv3p-tn-color-select/index.vue'
```

## 平台差异说明

| App(vue) | H5  | 微信小程序 | 支付宝小程序 |  ...   |
| :------: | :-: | :--------: | :----------: | :----: |
|    √     |  √  |     √      |      √       | 适配中 |

## 基础使用

- 通过`v-model`绑定选择的颜色的值

```vue
<script setup lang="ts">
import { ref } from 'vue'

const color = ref('')
</script>

<template>
  <TnColorSelect v-model="color" />
</template>
```

## 设置颜色预览框的大小

- 通过`size`设置颜色预览框的大小，预设的值有`sm`、`lg`、`xl`，同时也可以传递自定义的值

```vue
<TnColorSelect v-model="color" size="sm" />
<TnColorSelect v-model="color" size="lg" />
<TnColorSelect v-model="color" size="xl" />
<TnColorSelect v-model="color" size="120rpx" />
```

## API

### Props

| 属性名                  | 说明                                                 | 类型    | 默认值    | 可选值               |
| ----------------------- | ---------------------------------------------------- | ------- | --------- | -------------------- |
| `v-model`/`model-value` | 选择颜色的值                                         | String  | `#FF0000` | -                    |
| size                    | 颜色预览框的尺寸大小，可以使用可选值和指定的尺寸大小 | String  | -         | `sm` 、 `lg` 、 `xl` |
| disabled                | 禁用颜色选择器                                       | Boolean | `false`   | `true`               |
| validate-event          | 值发生修改时是否触发表单验证                         | Boolean | `true`    | `false`              |



### Emits

| 事件名 | 说明               | 类型                      |
| ------ | ------------------ | ------------------------- |
| change | 颜色发生改变时触发 | `(value: string) => void` |
