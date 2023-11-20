<template>
  <van-dialog v-model:show="show" :title="title" :showConfirmButton="false" :close-on-click-overlay="true" :beforeClose="beforeClose">
      <van-form @submit="onSubmit" label-width="60" colon validate-trigger="onSubmit">
        <van-cell-group inset>
          <van-field
            required
            v-model="todoForm.title"
            name="title"
            label="标题"
            placeholder="请填写标题"
            :rules="[{ required: true, message: '请填写标题!' }]"
          />
          <van-field
            required
            v-model="levelLabel"
            is-link
            readonly
            name="picker"
            label="优先级"
            placeholder="点击选择优先级"
            :rules="[{ required: true, message: '请选择优先级!' }]"
            @click="showLevelPicker = true"
          />
          <van-field
            required
            v-model="todoForm.content"
            name="content"
            label="内容"
            type="textarea"
            placeholder="请填写内容"
            :rules="[{ required: true, message: '请填写内容!' }]"
          />
          <van-field
            v-model="todoForm.comment"
            name="comment"
            label="备注"
            placeholder="请填写备注"
            :rules="[{ required: false, message: '请填写备注!' }]"
          />
        </van-cell-group>
        <div style="margin: 16px;">
          <van-button round block type="primary" native-type="submit">
            提交
          </van-button>
        </div>
      </van-form>
  </van-dialog>
  <van-popup v-model:show="showLevelPicker" position="bottom">
    <van-picker
      v-model="levelVal"
      :columns="columns"
      @confirm="onConfirm"
      :columns-field-names="columnsFieldNames"
      @cancel="showLevelPicker = false"
    />
  </van-popup>
  <van-toast></van-toast>
</template>

<script setup lang="ts">
import Api from '@/api';
import { ref, toRefs, onMounted, computed, shallowRef, watch, reactive } from 'vue';
// import { showNotify, showConfirmDialog, showToast } from 'vant';
import type { FormInstance } from 'vant';
import { levels } from '@/config'
const formRef = ref<FormInstance>();
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  isAdd: {
    type: Boolean,
    default: true
  },
  data: {
    type: Object,
    default: {}
  }
})
const isAdd = computed(() => props.isAdd)
const levelLabel = computed(() => {
  const item = levels.find(level => level.value === todoForm.value.level)
  return item?.label
})
const emit = defineEmits(['close'])
const show = ref(false)
const todoForm = ref<any>({
  title: '',
  content: '',
  level: '',
  commont: ''
})
watch(() => props.show, val => {
  show.value = val
  todoForm.value = props.data
  levelVal.value = [props.data.level]
}, {deep: true})

const levelVal = ref<any>([])
const title = computed(() => {
  return props.isAdd ? '新增待办' : '编辑待办'
})

const columns = levels
const columnsFieldNames = {
  text: 'label'
}
const showLevelPicker = ref(false)
const onConfirm = ({ selectedOptions }: { selectedOptions: any[]}) => {
  todoForm.value.level = selectedOptions[0].value
  showLevelPicker.value = false
}
const beforeClose = (action: string) => {
  show.value = false
  emit('close')
  return true
}

const onSubmit = async (values: any) => {
  const userid = uni.getStorageSync('userid')
  if (!userid) return showNotify({ color: '#ad0000', type: 'danger', message: '请先登录!' });
  try {
    const { title, content, comment }  = values
    const params = {
      userid,
      ...props.data,
      title,
      content,
      level: todoForm.value.level,
      startTime: null,
      endTime: null,
      comment
    }
    if (isAdd.value) {
      const { data } = await Api.addTodo(params)
      // showToast('新增成功!')
    } else {
      const { data } = await Api.updateTodo(params)
      // showToast('编辑成功!')
    }
    show.value = false
    emit('close')
  } catch (error: any) {
    // showNotify({ color: '#ad0000', background: '#ffe1e1', type: 'danger', message: error.message });
  }
}
formRef.value?.getValues()
</script>

<style scoped>

</style>