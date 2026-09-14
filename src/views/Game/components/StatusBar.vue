<script lang="ts" setup>
import {computed} from 'vue'
import {DIFFICULTY_MAP, MAX_ROUNDS, SEASON_MAP, termOfRound} from '@/game/config'
import {useGameEngine} from '@/game/useGame'
import {formatMoney} from '@/utils'

const {state, calcNetWorth, usedCapacity, advanceRound} = useGameEngine()

const season = computed(() => SEASON_MAP[state.season])
const term = computed(() => termOfRound(state.round))
const difficultyLabel = computed(() => DIFFICULTY_MAP[state.difficulty].label)
</script>

<template>
  <header
    class="shrink-0 px-3 lg:px-4 py-1.5 lg:py-2 bg-zinc-900/90 backdrop-blur-sm border-b border-white/10 flex flex-wrap items-center gap-x-3 lg:gap-x-5 gap-y-1 text-white"
  >
    <!-- 节气与回合 -->
    <div class="flex items-center gap-2">
      <span class="text-xl lg:text-2xl" :title="season.tagline">{{ season.emoji }}</span>
      <div class="leading-tight">
        <div class="font-bold text-sm lg:text-base">
          <span class="text-yellow-200">{{ term }}</span>
          <span class="hidden sm:inline text-gray-300 font-normal"> · {{ season.name }}季 · {{ season.tagline }}</span>
        </div>
        <div class="text-[11px] lg:text-xs text-gray-300">
          第 <span class="text-yellow-300">{{ state.round }}</span> / {{ MAX_ROUNDS }} 回合 · {{ difficultyLabel }}
        </div>
      </div>
    </div>

    <!-- 倒计时 -->
    <div class="flex items-center gap-1 rounded-lg px-2.5 py-1 bg-white/10">
      <span class="i-mdi-timer-outline text-base lg:text-lg" />
      <span
        class="font-mono font-bold text-lg lg:text-xl"
        :class="state.countdown <= 10 ? 'text-red-400' : 'text-white'"
      >
        {{ String(state.countdown).padStart(2, '0') }}s
      </span>
    </div>

    <!-- 现金 -->
    <div class="flex items-center gap-1">
      <span class="i-mdi-cash text-base lg:text-lg text-yellow-300" />
      <span class="text-xs lg:text-sm text-gray-300">现金</span>
      <span class="font-bold text-sm lg:text-base text-yellow-200">{{ formatMoney(state.cash) }}</span>
      <span class="text-[11px] lg:text-xs text-gray-400">两</span>
    </div>

    <!-- 净资产 -->
    <div class="flex items-center gap-1">
      <span class="i-mdi-scale-balance text-base lg:text-lg text-sky-300" />
      <span class="text-xs lg:text-sm text-gray-300">净资产</span>
      <span class="font-bold text-sm lg:text-base text-sky-200">{{ formatMoney(calcNetWorth()) }}</span>
      <span class="text-[11px] lg:text-xs text-gray-400">两</span>
    </div>

    <!-- 仓库 -->
    <div class="flex items-center gap-1">
      <span class="i-mdi-warehouse text-base lg:text-lg" />
      <span class="text-xs lg:text-sm text-gray-300">仓库</span>
      <span class="font-bold text-sm lg:text-base" :class="usedCapacity() >= state.capacity ? 'text-red-400' : ''">
        {{ usedCapacity() }}/{{ state.capacity }}
      </span>
    </div>

    <!-- 小道消息提示 -->
    <div
      v-if="state.intelTip"
      class="flex items-center gap-1 text-purple-300 text-[11px] lg:text-xs truncate basis-full sm:basis-auto sm:max-w-260px order-last sm:order-none"
    >
      <span class="i-mdi-information-outline shrink-0" />
      <span class="truncate">{{ state.intelTip }}</span>
    </div>

    <button
      class="ml-auto rounded-lg px-2.5 py-1.5 bg-white/10 hover:bg-white/25 text-xs lg:text-sm flex items-center gap-1"
      @click="advanceRound"
    >
      <span class="i-mdi-skip-next" />
      跳过本回合
    </button>
  </header>
</template>
