<script lang="ts" setup>
import {computed, reactive, ref} from 'vue'
import {DIFFICULTY_MAP, ITEMS_LIST} from '@/game/config'
import {useGameEngine} from '@/game/useGame'
import {formatMoney} from '@/utils'
import type {DifficultyType, ItemIdType} from '@/views/Type'

const {startGame} = useGameEngine()

const difficulty = ref<DifficultyType>('middle')
const cart = reactive<Record<ItemIdType, number>>({
    coupon: 0,
    warehouse: 0,
    intel: 0,
    amulet: 0,
    discount: 0
})

const DIFFICULTY_OPTIONS = (Object.keys(DIFFICULTY_MAP) as DifficultyType[])
    .map(key => ({key, ...DIFFICULTY_MAP[key]}))

const spent = computed(() => ITEMS_LIST.reduce((sum, item) => sum + item.price * cart[item.id], 0))
const remaining = computed(() => DIFFICULTY_MAP[difficulty.value].cash - spent.value)

const selectDifficulty = (d: DifficultyType) => {
    difficulty.value = d
    // 切换难度后清空购物车，避免透支
    const keys = Object.keys(cart) as ItemIdType[]
    keys.forEach(k => {
        cart[k] = 0
    })
}

const changeQty = (id: ItemIdType, delta: number) => {
    const item = ITEMS_LIST.find(i => i.id === id)!
    const next = cart[id] + delta
    if (next < 0 || next > item.max) return
    if (delta > 0 && remaining.value < item.price) return
    cart[id] = next
}

const handleStart = () => {
    startGame(difficulty.value, {...cart})
}
</script>

<template>
  <div class="absolute inset-0 z-20 flex items-center justify-center bg-black-50 backdrop-blur-sm p-4">
    <div class="w-full md:w-680px max-h-full overflow-y-auto rounded-2xl border border-white/10 bg-black-60 p-6 text-white shadow-2xl">
      <h1 class="text-3xl font-bold text-center tracking-wide">
        Trade War
        <span class="text-primary ml-2">贸易之战</span>
      </h1>
      <p class="text-center text-sm text-gray-300 mt-2">
        二十四节气轮转二十四回合，四季行商，低买高卖，成为一代巨贾
      </p>

      <!-- 难度选择 -->
      <section class="mt-6">
        <h2 class="text-base font-bold mb-3 flex items-center gap-2">
          <span class="i-mdi-treasure-chest-outline text-xl" />
          选择难度
        </h2>
        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="opt in DIFFICULTY_OPTIONS"
            :key="opt.key"
            class="rounded-xl border p-3 text-left transition"
            :class="difficulty === opt.key
              ? 'border-primary bg-primary/15 shadow-[0_0_12px_rgba(0,220,130,0.35)]'
              : 'border-white/15 bg-white/5 hover:border-white/40'"
            @click="selectDifficulty(opt.key)"
          >
            <div class="font-bold">{{ opt.label }}</div>
            <div class="text-xs text-gray-300 mt-1 leading-relaxed">{{ opt.desc }}</div>
            <div class="text-xs mt-2 text-yellow-300">本金 {{ formatMoney(opt.cash) }} 两</div>
          </button>
        </div>
      </section>

      <!-- 道具商城 -->
      <section class="mt-6">
        <h2 class="text-base font-bold mb-3 flex items-center gap-2">
          <span class="i-mdi-store-outline text-xl" />
          开局道具商城
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="item in ITEMS_LIST"
            :key="item.id"
            class="rounded-xl border border-white/15 bg-white/5 p-3 flex flex-col gap-1"
          >
            <div class="flex items-center gap-2">
              <span :class="item.icon" class="text-2xl text-yellow-300" />
              <span class="font-bold">{{ item.name }}</span>
              <span class="ml-auto text-xs text-yellow-300 whitespace-nowrap">{{ formatMoney(item.price) }} 两</span>
            </div>
            <p class="text-xs text-gray-300 leading-relaxed min-h-32px">{{ item.desc }}</p>
            <div class="flex items-center justify-between mt-1">
              <span class="text-xs text-gray-400">限购 {{ item.max }} 件</span>
              <div class="flex items-center gap-2">
                <button
                  class="w-7 h-7 rounded-full bg-white/10 hover:bg-white/25 disabled:opacity-30 flex items-center justify-center"
                  :disabled="cart[item.id] <= 0"
                  @click="changeQty(item.id, -1)"
                >
                  <span class="i-mdi-minus text-sm" />
                </button>
                <span class="w-6 text-center font-bold">{{ cart[item.id] }}</span>
                <button
                  class="w-7 h-7 rounded-full bg-primary/30 hover:bg-primary/55 disabled:opacity-30 flex items-center justify-center"
                  :disabled="cart[item.id] >= item.max || remaining < item.price"
                  @click="changeQty(item.id, 1)"
                >
                  <span class="i-mdi-plus text-sm" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 开始按钮 -->
      <footer class="mt-6 flex items-center gap-4">
        <div class="text-sm">
          采购后余银
          <span :class="remaining >= 0 ? 'text-yellow-300' : 'text-red-400'" class="font-bold text-lg">
            {{ formatMoney(remaining) }}
          </span>
          两
        </div>
        <button
          class="ml-auto px-8 py-3 rounded-xl bg-primary text-black font-bold text-lg hover:brightness-110 active:scale-95 transition shadow-[0_4px_18px_rgba(0,220,130,0.4)]"
          @click="handleStart"
        >
          开始经商 →
        </button>
      </footer>
    </div>
  </div>
</template>
