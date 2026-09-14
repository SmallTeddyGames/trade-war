<script lang="ts" setup>
import {computed, ref, watch} from 'vue'
import {DIFFICULTY_MAP, MAX_ROUNDS} from '@/game/config'
import {useGameEngine} from '@/game/useGame'
import {formatMoney} from '@/utils'

const {state, leaderboard, lastSavedId, holdingsValue, saveScore, restart} = useGameEngine()

const isWin = computed(() => state.gameState === 'win')
const playerName = ref('')
const saved = ref(false)

watch(
    () => state.gameState,
    v => {
        if (v === 'win' || v === 'lose') {
            saved.value = false
            playerName.value = ''
        }
    }
)

const handleSave = () => {
    if (saveScore(playerName.value)) saved.value = true
}

const medal = (i: number) => (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '')
</script>

<template>
  <div class="fixed inset-0 z-40 flex items-center justify-center bg-black-60 backdrop-blur-sm p-4">
    <div class="w-full md:w-560px max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-zinc-900/95 p-6 text-white shadow-2xl">
      <!-- 结果 -->
      <div class="text-center">
        <div class="text-6xl">{{ isWin ? '🏆' : '💸' }}</div>
        <h2 class="text-3xl font-bold mt-2" :class="isWin ? 'text-primary' : 'text-red-400'">
          {{ isWin ? '功成身退！' : '商海折戟……' }}
        </h2>
        <p class="text-sm text-gray-300 mt-1">
          {{ isWin ? `${MAX_ROUNDS} 回合（二十四节气）期满，你带着盈余全身而退` : '债务缠身，你破产了' }}
        </p>
      </div>

      <!-- 结算数据 -->
      <div class="grid grid-cols-2 gap-3 mt-5">
        <div class="rounded-xl bg-white/5 p-3">
          <div class="text-xs text-gray-400">坚持回合</div>
          <div class="text-xl font-bold">{{ state.round }} / {{ MAX_ROUNDS }}</div>
        </div>
        <div class="rounded-xl bg-white/5 p-3">
          <div class="text-xs text-gray-400">难度</div>
          <div class="text-xl font-bold">{{ DIFFICULTY_MAP[state.difficulty].label }}</div>
        </div>
        <div class="rounded-xl bg-white/5 p-3">
          <div class="text-xs text-gray-400">结余现金</div>
          <div class="text-xl font-bold text-yellow-200">{{ formatMoney(state.cash) }} 两</div>
        </div>
        <div class="rounded-xl bg-white/5 p-3">
          <div class="text-xs text-gray-400">货仓折价</div>
          <div class="text-xl font-bold text-sky-200">{{ formatMoney(holdingsValue()) }} 两</div>
        </div>
      </div>
      <div
        class="mt-3 rounded-xl p-4 text-center border"
        :class="isWin
          ? 'bg-primary/15 border-primary/40'
          : 'bg-red-500/10 border-red-400/30'"
      >
        <span class="text-sm text-gray-300">最终净资产</span>
        <div class="text-3xl font-bold" :class="isWin ? 'text-primary' : 'text-red-300'">
          {{ formatMoney(state.finalNetWorth) }} 两
        </div>
      </div>

      <!-- 记入排行榜 -->
      <div class="mt-4 flex gap-2">
        <input
          v-model="playerName"
          type="text"
          maxlength="12"
          placeholder="留下你的商名"
          class="flex-1 rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
          :disabled="saved"
          @keyup.enter="handleSave"
        >
        <button
          class="rounded-xl px-4 py-2 text-sm font-bold"
          :class="saved ? 'bg-white/10 text-gray-400' : 'bg-primary text-black hover:brightness-110'"
          :disabled="saved"
          @click="handleSave"
        >
          {{ saved ? '已记入' : '记入排行榜' }}
        </button>
      </div>

      <!-- 排行榜 -->
      <div class="mt-4">
        <h3 class="flex items-center gap-2 text-sm font-bold text-gray-300 mb-2">
          <span class="i-mdi-trophy-variant text-lg text-yellow-300" />
          商贾风云榜（Top 10）
        </h3>
        <div class="rounded-xl border border-white/10 overflow-hidden">
          <div v-if="leaderboard.length === 0" class="p-4 text-center text-xs text-gray-400">
            榜单尚空，静候第一位传奇商人
          </div>
          <div
            v-for="(entry, i) in leaderboard"
            :key="entry.id"
            class="flex items-center gap-3 px-3 py-2 text-sm border-b border-white/5 last:border-none"
            :class="[
              entry.id === lastSavedId ? 'bg-primary/15' : i % 2 ? 'bg-white/[0.03]' : ''
            ]"
          >
            <span class="w-8 text-center font-bold text-gray-400">{{ medal(i) || i + 1 }}</span>
            <span class="flex-1 truncate font-bold">{{ entry.name }}</span>
            <span class="text-xs" :class="entry.win ? 'text-primary' : 'text-red-400'">
              {{ entry.win ? '胜' : '破产' }}
            </span>
            <span class="text-xs text-gray-400">{{ DIFFICULTY_MAP[entry.difficulty].label }}</span>
            <span class="w-24 text-right font-mono text-yellow-200">{{ formatMoney(entry.netWorth) }}</span>
          </div>
        </div>
      </div>

      <button
        class="mt-5 w-full py-3 rounded-xl bg-white/10 hover:bg-white/25 font-bold"
        @click="restart"
      >
        再战一回
      </button>
    </div>
  </div>
</template>
