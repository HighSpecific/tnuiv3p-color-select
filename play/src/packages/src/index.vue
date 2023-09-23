<script lang="ts" setup>
import TnIcon from '@tuniao/tnui-vue3-uniapp/components/icon/src/icon.vue'
import TnPopup from '@tuniao/tnui-vue3-uniapp/components/popup/src/popup.vue'
import TnButton from '@tuniao/tnui-vue3-uniapp/components/button/src/button.vue'
import { colorSelectEmits, colorSelectProps } from './types'
import { useColorSelect, useColorSelectCustomStyle } from './composables'

const props = defineProps(colorSelectProps)
const emits = defineEmits(colorSelectEmits)

const {
  alphaContainerId,
  hueContainerId,
  saturationCanvasId,
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
  switchColorFormat,
  alphaTouchStartHandle,
  alphaTouchMovingHandle,
  alphaTouchEndHandle,
  hueTouchStartHandle,
  hueTouchMovingHandle,
  hueTouchEndHandle,
  saturationTouchStartHandle,
  saturationTouchMovingHandle,
  saturationTouchEndHandle,
} = useColorSelect(props, emits)
const { ns, colorSelectClass, colorSelectStyle } =
  useColorSelectCustomStyle(props)
</script>

<template>
  <view
    :class="[colorSelectClass]"
    :style="colorSelectStyle"
    @tap.stop="openSelectColorPicker"
  >
    <view :class="[ns.em('color-preview', 'wrapper')]">
      <view
        :class="[ns.e('color-preview')]"
        :style="{
          backgroundColor: previewColor,
          color: previewDarkBg ? '#fff' : '#000',
        }"
      >
        <view :class="[ns.e('operation-icon')]">
          <TnIcon name="theme" />
        </view>
      </view>
    </view>
  </view>

  <TnPopup
    v-model="showSelectColorPicker"
    open-direction="center"
    width="90%"
    :overlay-closeable="false"
  >
    <view :class="[ns.e('color-picker-container')]">
      <view :class="[ns.e('color-picker')]">
        <!-- header 头部 -->
        <view
          :class="[ns.em('color-picker', 'header')]"
          :style="{ backgroundColor: currentSelectColor }"
          @tap.stop="switchColorFormat"
        >
          <view
            class="brightness-icon"
            :style="{ filter: `invert(${useDarkBg ? 1 : 0})` }"
          />
          <view
            class="color-value"
            :style="{ color: useDarkBg ? '#fff' : '#000' }"
          >
            {{ colorValue }}
          </view>
        </view>

        <!-- 选择滑动区 -->
        <view
          v-if="showSelectColorPicker"
          :class="[ns.em('color-picker', 'select-operation')]"
        >
          <!-- saturation -->
          <view
            class="saturation-box"
            @touchstart.stop.prevent="saturationTouchStartHandle"
            @touchmove="saturationTouchMovingHandle"
            @touchend="saturationTouchEndHandle"
          >
            <!-- #ifdef H5 -->
            <view
              class="saturation-slider"
              :style="{
                left: `${saturationSliderPositionInfo.x}px`,
                top: `${saturationSliderPositionInfo.y}px`,
              }"
            />
            <!-- #endif -->
            <!-- #ifndef H5 -->
            <cover-view
              class="saturation-slider"
              :style="{
                left: `${saturationSliderPositionInfo.x}px`,
                top: `${saturationSliderPositionInfo.y}px`,
              }"
            />
            <!-- #endif -->
            <canvas
              :id="saturationCanvasId"
              :canvas-id="saturationCanvasId"
              class="saturation-canvas"
            />
          </view>

          <!-- 透明度、色调 -->
          <view class="strips">
            <!-- 透明度 -->
            <view
              :id="alphaContainerId"
              class="strip alpha"
              @touchstart.stop.prevent="alphaTouchStartHandle"
              @touchmove="alphaTouchMovingHandle"
              @touchend="alphaTouchEndHandle"
            >
              <view
                class="alpha-preview"
                :style="{
                  background: `linear-gradient(to bottom, ${currentSelectColorWithDefault(
                    '#FF0000'
                  )} 0%, transparent 100%)`,
                }"
              />
              <view
                class="slider"
                :style="{ top: `${alphaSliderPositionInfo.y}px` }"
              />
            </view>

            <!-- 色调 -->
            <view
              :id="hueContainerId"
              class="strip hue"
              @touchstart.stop.prevent="hueTouchStartHandle"
              @touchmove="hueTouchMovingHandle"
              @touchend="hueTouchEndHandle"
            >
              <view
                class="slider"
                :style="{ top: `${hueSliderPositionInfo.y}px` }"
              />
            </view>
          </view>
        </view>
      </view>
      <view :class="[ns.e('color-picker-operation')]">
        <view class="button">
          <TnButton type="danger" size="lg" @click="cancelHandle">
            取消
          </TnButton>
        </view>
        <view class="button">
          <TnButton type="primary" size="lg" @click="confirmHandle">
            确认
          </TnButton>
        </view>
      </view>
    </view>
  </TnPopup>
</template>

<style lang="scss" scoped>
@import './theme-chalk/index.scss';
</style>
