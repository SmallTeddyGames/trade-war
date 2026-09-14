<script lang="ts" setup>
import {computed, nextTick, ref, watch} from 'vue'
import {GOODS_LIST, ITEMS_LIST} from '@/game/config'
import {useGameEngine} from '@/game/useGame'
import {formatMoney} from '@/utils'

const {state, unitValue, recycle, useCoupon, useIntel} = useGameEngine()

/**
 * 当前持仓
 */
const holdingsList = computed(() =>
    GOODS_LIST
        .filter(g => (state.holdings[g.id] ?? 0) > 0)
        .map(g => ({
            cfg: g,
            qty: state.holdings[g.id],
            available: state.goods[g.id]?.available ?? false,
            unit: unitValue(g.id)
        }))
)

/**
 * 已拥有的道具
 */
const ownedItems = computed(() =>
    ITEMS_LIST.filter(i => state.items[i.id] > 0)
)

const useItem = (id: string) => {
    if (id === 'coupon') useCoupon()
    else if (id === 'intel') useIntel()
}

/**
 * 日志回合标签：R01~R24；开局日志（round=0）显示【开张】
 */
const roundTag = (round: number): string =>
    round === 0 ? '【开张】' : `[R${String(round).padStart(2, '0')}]`

/**
 * 日志自动滚动到底部
 */
const logBox = ref<HTMLElement | null>(null)
watch(
    () => state.logs.length,
    async () => {
        await nextTick()
        if (logBox.value) logBox.value.scrollTop = logBox.value.scrollHeight
    }
)
</script>

<template>
  <section
    class="shrink-0 px-3 lg:px-4 pb-[max(0.625rem,env(safe-area-inset-bottom))] lg:pb-3 grid gap-2 lg:gap-3 text-white
           grid-cols-1 sm:grid-cols-3 lg:grid-cols-[1fr_11.25rem_17.5rem]
           lg:h-[clamp(9.5rem,17vh,11.5rem)]"
  >
    <!-- 持仓 -->
    <div class="rounded-xl bg-zinc-900/90 backdrop-blur-sm border border-white/10 flex flex-col min-h-0 shadow-lg h-16 sm:h-auto sm:min-h-[7.5rem] lg:min-h-0">
      <h3
        class="px-3 py-1.5 text-xs font-bold text-gray-300 flex items-center gap-1 border-b border-white/10"
      >
        <span class="i-mdi-basket-outline" />
        我的货仓
      </h3>
      <div class="flex-1 overflow-y-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch] p-2 flex flex-wrap content-start gap-2">
        <div v-if="holdingsList.length === 0" class="text-xs text-gray-400 p-2">
          货仓空空如也，快去集市低买高卖吧。
        </div>
        <div
          v-for="item in holdingsList"
          :key="item.cfg.id"
          class="rounded-lg bg-white/8 px-2 py-1 flex items-center gap-1 text-xs"
        >
          <span class="text-base">{{ item.cfg.emoji }}</span>
          <span class="font-bold">{{ item.cfg.name }}</span>
          <span class="text-yellow-200">×{{ item.qty }}</span>
          <span class="text-gray-300">≈ {{ formatMoney(item.unit * item.qty) }}两</span>
          <button
            v-if="!item.available"
            class="ml-1 rounded px-1.5 py-0.5 bg-orange-500/80 hover:bg-orange-500 text-[10px]"
            title="过季货物按半价全部回收"
            @click="recycle(item.cfg.id)"
          >
            半价回收
          </button>
        </div>
      </div>
    </div>

    <!-- 道具 -->
    <div class="rounded-xl bg-zinc-900/90 backdrop-blur-sm border border-white/10 flex flex-col min-h-0 shadow-lg h-16 sm:h-auto sm:min-h-[7.5rem] lg:min-h-0">
      <h3
        class="px-3 py-1.5 text-xs font-bold text-gray-300 flex items-center gap-1 border-b border-white/10"
      >
        <span class="i-mdi-diamond-outline" />
        我的道具
      </h3>
      <div class="flex-1 overflow-y-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch] p-2 flex flex-col gap-2 justify-start">
        <div v-if="ownedItems.length === 0" class="text-xs text-gray-400 p-1">
          开局可在道具商城采购。
        </div>
        <template v-for="item in ownedItems" :key="item.id">
          <button
            v-if="!item.passive"
            class="rounded-lg bg-white/10 hover:bg-white/25 px-2 py-1.5 flex items-center gap-2 text-xs text-left"
            @click="useItem(item.id)"
          >
            <span :class="item.icon" class="text-lg text-yellow-300" />
            <span>
              <span class="block font-bold">{{ item.name }} ×{{ state.items[item.id] }}</span>
              <span class="block text-[10px] text-gray-300">{{ item.desc }}</span>
            </span>
          </button>
          <div
            v-else
            class="rounded-lg bg-primary/10 border border-primary/30 px-2 py-1.5 flex items-center gap-2 text-xs"
          >
            <span :class="item.icon" class="text-lg text-primary" />
            <span>
              <span class="block font-bold">{{ item.name }}</span>
              <span class="block text-[10px] text-gray-300">{{ item.desc }}</span>
            </span>
          </div>
        </template>
      </div>
    </div>

    <!-- 日志 -->
    <div class="rounded-xl bg-zinc-900/90 backdrop-blur-sm border border-white/10 flex flex-col min-h-0 shadow-lg h-16 sm:h-auto sm:min-h-[7.5rem] lg:min-h-0">
      <h3
        class="px-3 py-1.5 text-xs font-bold text-gray-300 flex items-center gap-1 border-b border-white/10"
      >
        <span class="i-mdi-script-text-outline" />
        经商日志
      </h3>
      <div ref="logBox" class="flex-1 overflow-y-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch] px-3 py-1 text-xs leading-relaxed font-mono">
        <div
          v-for="log in state.logs"
          :key="log.id"
          :class="{
            'text-gray-300': log.type === 'info',
            'text-green-300': log.type === 'good',
            'text-red-300': log.type === 'bad',
            'text-sky-300': log.type === 'trade'
          }"
        >
          <span class="text-gray-500">{{ roundTag(log.round) }}</span> {{ log.text }}
        </div>
      </div>
    </div>
  </section>
</template>
