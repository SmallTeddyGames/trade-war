<script lang="ts" setup>
import {computed} from 'vue'
import GoodsCard from './GoodsCard.vue'
import {SEASON_MAP} from '@/game/config'
import {useGameEngine} from '@/game/useGame'

const {state, marketGoods} = useGameEngine()

const goodsList = computed(() => marketGoods())
</script>

<template>
  <section class="flex flex-col flex-1 min-h-0 px-3 lg:px-4 pt-2 lg:pt-3">
    <div class="flex items-center gap-2 text-white mb-1.5 lg:mb-2 shrink-0">
      <span class="i-mdi-store text-base lg:text-xl" />
      <h2 class="font-bold text-sm lg:text-base">集市行情</h2>
      <span class="text-[10px] lg:text-xs text-gray-300 hidden md:inline">
        {{ SEASON_MAP[state.season].emoji }} {{ SEASON_MAP[state.season].name }}季 ·
        公共货物常年开市，特供货物过季只能半价回收
      </span>
    </div>

    <!--
      手机/平板：集市卡片区域在一屏内独立纵向滚动，底部三面板固定常驻（原生 App 式布局，
      保证任何内容都可到达，不会被裁切）；
      桌面 lg+：4 列 × 3 行铺满剩余空间，不滚动
    -->
    <div
      class="grid gap-2 lg:gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 content-start
             [grid-auto-rows:minmax(6.8rem,auto)] sm:[grid-auto-rows:minmax(7.5rem,auto)]
             flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y
             [-webkit-overflow-scrolling:touch] pb-2 lg:pb-3
             lg:content-stretch lg:[grid-auto-rows:auto]
             lg:grid-rows-[repeat(3,minmax(0,1fr))] lg:overflow-hidden"
    >
      <GoodsCard
        v-for="cfg in goodsList"
        :key="cfg.id"
        :cfg="cfg"
        :rt="state.goods[cfg.id]"
      />
    </div>
  </section>
</template>
