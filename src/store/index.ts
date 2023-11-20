import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
export const useCommonStore = defineStore('common-store', () => {
  const userid = ref(uni.getStorageSync('userid'))
  const token = ref(uni.getStorageSync('token'))
  const userinfo = ref(uni.getStorageSync('userinfo'))
})