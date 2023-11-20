<template>
  <div class="home">
    <van-nav-bar class="header">
        <template #right>
          <div class="btn-white" v-if="userinfo?.username">
            <span class="btn-white">{{userinfo?.username}}</span>
            <van-divider vertical :style="{ borderColor: '#ffffff' }" />
            <span class="btn-white" @click="logout">退出</span>  
          </div>
          <div v-else>
            <span class="btn-white" @click="show = true">登录</span>
            <van-divider vertical :style="{ borderColor: '#ffffff' }" />
            <span class="btn-white">注册</span>
          </div>
        </template>
        <template #left>
          <div class="btn-white">墨香待办</div>
        </template>
    </van-nav-bar>
    <van-dialog v-model:show="show" title="登录" :showConfirmButton="false" :close-on-click-overlay="true">
      <van-form @submit="onSubmit"  label-width="50" colon validate-trigger="['onSubmit', 'onChange']">
        <van-cell-group inset>
          <van-field
            required
            v-model="username"
            name="username"
            label="账号"
            placeholder="请填写账号或者邮箱"
            :rules="[{ required: true, message: '请填写账号或者邮箱!' }]"
          />
          <van-field
            required
            v-model="password"
            type="password"
            name="password"
            label="密码"
            placeholder="密码"
            :rules="[{ required: true, message: '请填写密码' }]"
          />
        </van-cell-group>
        <div style="margin: 16px;">
          <van-button round block type="primary" native-type="submit">
            登录
          </van-button>
        </div>
      </van-form>
    </van-dialog>
    <van-floating-bubble axis="xy"
    icon="plus"
    magnetic="x" v-model:offset="offset" @click="addTodo" />
    <van-notify></van-notify>
    <van-pull-refresh v-model="refreshing" disabled  @refresh="onRefresh"  v-if="list.length">
      <van-list
        class="list"
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        :offset="0"
        @load="getList"
      >
        <van-swipe-cell class="list-item" inset v-for="item in list" :key="item.id" :before-close="beforeClose" >
          <van-cell center value-class="item-value" :title="item.title" :label="item.content">
            <template #value>
              <van-tag :color="levelItem(item.level)?.color">{{ levelItem(item.level)?.label }}</van-tag>
            </template>
          </van-cell>
          <template #right>
            <van-button class="btn" square type="primary" text="编辑" @click="handleTodo('update', item)" />
            <van-button class="btn" square type="danger" text="删除" @click="handleTodo('delete', item)" />
          </template>
        </van-swipe-cell>
      </van-list>
    </van-pull-refresh>
    <van-empty description="暂无数据"  v-else/>
  </div>
  <todo-item :show="todoShow" :data="todoForm" :is-add="isAdd" @close="onCloseTodoItem"/>
  <van-toast></van-toast>
</template>

<script setup lang="ts">
import Api from '@/api';
import { ref, onMounted, onUnmounted, computed, shallowRef, watch, reactive } from 'vue';
// import { showNotify, showConfirmDialog, showToast } from 'vant';
import todoItem from './todoItem.vue';
// @ts-ignore
import CryptoJS from 'crypto-js';
import { secretPwKey } from '@/config/secret'; 
import { levels } from '@/config';
const token = ref(uni.getStorageSync('token'))
const show = ref(false)
const username = ref('');
const password = ref('');
const userinfo = shallowRef()
const levelItem = computed(() => {
  return (val: string) => {
    return levels.find(level => level.value === val);
  }
})
const onSubmit = async (values: any) => {
  try {
    const { username, password }  = values
    const encryptedPassword = CryptoJS.AES.encrypt(password, secretPwKey).toString();
    const { data } = await Api.login({ username,  password: encryptedPassword })
    userinfo.value = data
    show.value = false
    uni.setStorageSync('token', data.token)
    uni.setStorageSync('userid', data.id)
    uni.setStorageSync('userinfo', JSON.stringify(data))
  } catch (error: any) {
    // showNotify({ color: '#ad0000', background: '#ffe1e1', type: 'danger', message: error.message });
  }
}
const logout = () => {
  show.value = false
  username.value = ''
  password.value = ''
  uni.removeStorageSync('token')
  uni.removeStorageSync('userid')
  uni.removeStorageSync('userinfo')
  userinfo.value = {}
}

// 列表数据
const loading = ref(false)
const finished = ref(false)
const list = ref<any[]>([])
const total = ref(0)
const pageNum = ref(1)
const getList = async () => {
  if (!token.value) return loading.value = false
  const params = {
      userid: uni.getStorageSync('userid'),
      pageNum: pageNum.value,
      pageSize: 10
    }
    try {
      const { data } = await Api.getTodoList(params)
      const array = data.data
      list.value = [...list.value, ...array]
      total.value = data.total
      loading.value = true
      if (list.value.length < total.value) {
        pageNum.value++
        loading.value = false
      } else {
        finished.value = true
        loading.value = false
      }
    } catch (error: any) {
      loading.value = false
      // showNotify({ type: 'danger', message: error.message });
    }
}
const refreshing = ref(false)
const onRefresh = () => {
    // 清空列表数据
    finished.value = false;
    // 重新加载数据
    // 将 loading 设置为 true，表示处于加载状态
    loading.value = true;
    getList();
};
const listId = ref('')
const deleteItem = async () => {
  if (!token.value) return
  try {
    const { data } = await Api.deleteTodo({id: listId.value})
    list.value = []
    pageNum.value = 1
    // showToast('删除成功!')
    getList()
  } catch (error: any) {
    // showNotify({ type: 'danger', message: error.message });
  }
}
const todoShow = ref(false)
const onCloseTodoItem = () => {
  todoShow.value = false
  todoForm.value = {
    title: '',
    content: '',
    level: '',
    commont: ''
  }
  list.value = []
  pageNum.value = 1
  getList()
}
const todoForm = shallowRef()
const beforeClose = ({ position }: { position: string }) => {
  const isUpdate = todoType.value === 'update'
  switch (position) {
    case 'left':
    case 'cell':
    case 'outside':
      return true;
    case 'right':
      if (isUpdate) {
        return false
      }
      // return new Promise((resolve) => {
      //   showConfirmDialog({
      //     title: '确定删除吗？',
      //   })
      //     .then(() => {
      //       deleteItem()

      //       resolve(true)
      //     })
      //     .catch(() => resolve(false));
      // })
  }
}
const todoType = ref('')
const isAdd = ref(true)
const handleTodo = (type: string, item: any) => {
  listId.value = item.id
  todoType.value = type
  if (type === 'update') {
    todoForm.value = item
    todoShow.value = true
    isAdd.value = false
  }
}
const offset = ref({ x: 300, y: 500 })
const addTodo = () => {
  todoShow.value = true
  isAdd.value = true
  todoForm.value = {
    title: '',
    content: '',
    level: '',
    commont: ''
  }
}
watch(() => show.value, (val) => {
  if (!val) {
    pageNum.value = 1
    getList()
  } else {
    list.value = []
    total.value = 0
  }
})
const setOffset = () => {
  const clientWidth = document.body.clientWidth
  const clientHeight = document.body.clientHeight
  const pixel = window.devicePixelRatio || 2
  offset.value = {
    x: clientWidth - (36 * pixel) || 300,
    y: clientHeight - (87 * pixel) || 500
  }
}
onMounted(() => {
  let info = uni.getStorageSync('userinfo')
  if (info) {
    info = JSON.parse(info)
    userinfo.value = info
  }
  // window.addEventListener('resize', setOffset)
})
onUnmounted(() => {
  // window.removeEventListener('resize', setOffset)
})
</script>

<style lang="scss" scoped>
.home {
  background-color: #fafbfc;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}
.header {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 44px;
  background-color: #a25158;
}
.list {
  padding: 64px 0 20px 0;
  .list-item {
    margin-bottom: 10px;
  }
}
.btn {
  height: 100%;
}
</style>