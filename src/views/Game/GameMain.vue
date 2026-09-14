<script lang="ts" setup>
import StartScreen from './components/StartScreen.vue'
import StatusBar from './components/StatusBar.vue'
import GoodsMarket from './components/GoodsMarket.vue'
import PlayerPanel from './components/PlayerPanel.vue'
import EventToast from './components/EventToast.vue'
import Settlement from './components/Settlement.vue'
import {useGameEngine} from '@/game/useGame'

const {state, togglePause, restart} = useGameEngine()
</script>

<template>
  <div class="relative h-full w-full flex flex-col min-h-0 overflow-hidden">
    <!-- 开局：难度选择 + 道具商城 -->
    <StartScreen v-if="state.gameState === 'init'" />

    <template v-else>
      <!-- 顶部状态区域 -->
      <StatusBar />
      <!-- 货物区域 -->
      <GoodsMarket />
      <!-- 玩家区域 -->
      <PlayerPanel />
      <!-- 随机事件播报 -->
      <EventToast />

      <!-- 暂停遮罩 -->
      <div
        v-if="state.gameState === 'pause'"
        class="fixed inset-0 z-30 flex items-center justify-center flex-col gap-5 bg-black-60 backdrop-blur-sm text-white"
      >
        <div class="i-mdi-pause-circle-outline text-7xl text-primary" />
        <h2 class="text-2xl font-bold">商队暂歇</h2>
        <div class="flex gap-3">
          <button
            class="px-6 py-2.5 rounded-xl bg-primary text-black font-bold hover:brightness-110"
            @click="togglePause"
          >
            继续经商
          </button>
          <button
            class="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/25"
            @click="restart"
          >
            放弃本局
          </button>
        </div>
      </div>

      <!-- 结算 + 排行榜 -->
      <Settlement v-if="state.gameState === 'win' || state.gameState === 'lose'" />
    </template>
  </div>
</template>
