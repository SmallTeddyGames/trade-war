<script lang="ts" setup>
import {computed, ref, watch} from 'vue'
import type {GoodsConfig, GoodsRuntime} from '@/views/Type'
import {useGameEngine} from '@/game/useGame'
import {useGeneratedImage} from '@/game/useGeneratedImage'
import {formatMoney} from '@/utils'

const props = defineProps<{
    cfg: GoodsConfig
    rt: GoodsRuntime
}>()

const {state, buy, sell} = useGameEngine()

const qty = ref(1)
const imgError = ref(false)
// 文生图首次返回占位图，自动探测刷新真图
const {displayUrl: imageUrl} = useGeneratedImage(() => props.cfg.image)

// 每回合重置数量
watch(() => state.round, () => {
    qty.value = 1
})

const held = computed(() => state.holdings[props.cfg.id] ?? 0)
const up = computed(() => props.rt.price > props.rt.prevPrice)
const down = computed(() => props.rt.price < props.rt.prevPrice)
const buyUnit = computed(() =>
    Math.round(props.rt.price * (state.items.discount > 0 ? 0.95 : 1))
)
const maxAffordable = computed(() =>
    Math.min(
        Math.floor(state.cash / buyUnit.value),
        state.capacity - Object.values(state.holdings).reduce((s, n) => s + n, 0)
    )
)

const setQty = (value: number) => {
    qty.value = Math.max(1, value)
}

const handleBuy = () => {
    if (buy(props.cfg.id, qty.value)) qty.value = 1
}
const handleSell = () => {
    sell(props.cfg.id, qty.value)
}
</script>

<template>
  <div
    class="rounded-xl overflow-hidden border flex flex-row bg-zinc-900/90 backdrop-blur-sm shadow-lg min-h-0"
    :class="rt.eventType === 'surge'
      ? 'border-red-400/70 shadow-[0_0_14px_rgba(248,113,113,0.35)]'
      : rt.eventType === 'crash'
        ? 'border-green-400/70 shadow-[0_0_14px_rgba(74,222,128,0.3)]'
        : 'border-white/10'"
  >
    <!-- 左侧：货物图 -->
    <div class="relative w-14 sm:w-20 md:w-24 lg:w-28 xl:w-32 shrink-0 self-stretch bg-zinc-800">
      <img
        v-if="!imgError"
        :src="imageUrl"
        :alt="cfg.name"
        class="w-full h-full object-cover"
        @error="imgError = true"
      >
      <span v-else class="absolute inset-0 flex items-center justify-center text-3xl lg:text-4xl">{{ cfg.emoji }}</span>

      <!-- 货物类型标签 -->
      <span
        class="absolute left-1 top-1 text-[9px] lg:text-[10px] rounded px-1 py-0.5 text-white"
        :class="cfg.season === 'all' ? 'bg-white/25' : 'bg-purple-500/85'"
      >
        {{ cfg.season === 'all' ? '公共' : '特供' }}
      </span>

      <!-- 事件标签 -->
      <span
        v-if="rt.eventType === 'surge'"
        class="absolute right-1 top-1 text-[9px] lg:text-[10px] font-bold rounded px-1 py-0.5 bg-red-500 text-white animate-pulse"
      >
        暴涨
      </span>
      <span
        v-else-if="rt.eventType === 'crash'"
        class="absolute right-1 top-1 text-[9px] lg:text-[10px] font-bold rounded px-1 py-0.5 bg-green-500 text-black animate-pulse"
      >
        暴跌
      </span>

      <span
        v-if="held > 0"
        class="absolute left-1 bottom-1 text-[10px] rounded px-1 py-0.5 bg-sky-500/90 text-white"
      >
        持有 ×{{ held }}
      </span>
    </div>

    <!-- 右侧：名称 / 描述 / 价格 / 操作 -->
    <div class="flex-1 min-w-0 p-1.5 sm:p-2 lg:p-2.5 flex flex-col gap-0.5 lg:gap-1">
      <!-- 名称 + 当前价 -->
      <div class="flex items-center gap-1">
        <span class="font-bold text-white truncate text-[clamp(0.82rem,0.45vw+0.6rem,1.02rem)]">{{ cfg.name }}</span>
        <div class="ml-auto flex items-center gap-0.5 shrink-0">
          <span
            class="font-mono font-bold text-[clamp(0.92rem,0.7vw+0.55rem,1.22rem)] leading-none"
            :class="up ? 'text-red-400' : down ? 'text-green-400' : 'text-white'"
          >
            {{ formatMoney(rt.price) }}
          </span>
          <span v-if="up" class="i-mdi-arrow-up-bold text-red-400 text-xs lg:text-sm" />
          <span v-else-if="down" class="i-mdi-arrow-down-bold text-green-400 text-xs lg:text-sm" />
        </div>
      </div>

      <!-- 描述：合理区间 -->
      <div class="text-[9px] lg:text-[10px] text-gray-400 flex items-center justify-between gap-1">
        <span class="truncate">区间 {{ formatMoney(cfg.min) }}~{{ formatMoney(cfg.max) }}</span>
        <span v-if="state.items.discount > 0" class="text-primary shrink-0">买价95折</span>
      </div>

      <!-- 操作区：移动端两行（数量+全仓 / 买入+卖出），桌面一行 -->
      <div class="mt-auto grid grid-cols-2 lg:grid-cols-[2.6rem_auto_minmax(0,1fr)_minmax(0,1fr)] gap-1">
        <input
          v-model.number="qty"
          type="number"
          min="1"
          class="h-7 lg:h-8 w-full px-1 text-center rounded bg-white/10 text-white text-xs lg:text-sm border border-white/10 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          @change="setQty(Number(qty) || 1)"
        >
        <button
          class="h-7 lg:h-8 rounded bg-white/10 hover:bg-white/25 text-white text-[10px] lg:text-xs whitespace-nowrap disabled:opacity-30"
          :disabled="maxAffordable <= 0"
          @click="setQty(Math.max(1, maxAffordable))"
        >
          全仓
        </button>
        <button
          class="h-7 lg:h-8 rounded bg-primary/90 hover:bg-primary text-black font-bold text-[11px] lg:text-sm flex items-center justify-center gap-0.5 disabled:opacity-30"
          :disabled="maxAffordable <= 0"
          @click="handleBuy"
        >
          <span class="i-mdi-arrow-up-bold" />
          买入
        </button>
        <button
          class="h-7 lg:h-8 rounded bg-red-500/85 hover:bg-red-500 text-white font-bold text-[11px] lg:text-sm flex items-center justify-center gap-0.5 disabled:opacity-30"
          :disabled="held <= 0"
          @click="handleSell"
        >
          <span class="i-mdi-arrow-down-bold" />
          卖出
        </button>
      </div>
    </div>
  </div>
</template>
