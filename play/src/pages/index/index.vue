<script setup lang="ts">
import { ref } from 'vue'
import TnColorSelect from '../../packages/src/index.vue'

const color = ref('#01BEFF54')
</script>

<template>
  {{ color }}
  <view class="content">
    <view class="item">
      <TnColorSelect v-model="color" size="sm" disabled />
    </view>
    <view class="item">
      <TnColorSelect v-model="color" />
    </view>
    <view class="item">
      <TnColorSelect v-model="color" size="lg" />
    </view>
    <view class="item">
      <TnColorSelect v-model="color" size="xl" />
    </view>
    <view class="item">
      <TnColorSelect v-model="color" size="120" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.content {
  padding: 30rpx;
  display: flex;
  align-items: center;

  .item {
    & + .item {
      margin-left: 30rpx;
    }
  }
}
</style>
