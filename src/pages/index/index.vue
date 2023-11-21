<template>
	<view class="container">
    <mp-icon icon="add" color="black" size="{{25}}"></mp-icon> 
    <div>测试</div>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const cover = ref('https://qiniu-web-assets.dcloud.net.cn/unidoc/zh/shuijiao.jpg')
const avatar = ref('https://qiniu-web-assets.dcloud.net.cn/unidoc/zh/shuijiao.jpg')
const extraIcon = ref({
  color: '#4cd964',
  size: '22',
  type: 'gear-filled'
})
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo {
  height: 200rpx;
  width: 200rpx;
  margin-top: 200rpx;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 50rpx;
}

.text-area {
  display: flex;
  justify-content: center;
}

.title {
  font-size: 36rpx;
  color: #8f8f94;
}
</style>
