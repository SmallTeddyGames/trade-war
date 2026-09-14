<script lang="ts" setup>
import {ref, watch} from 'vue'
import {useGameEngine} from '@/game/useGame'

const {state} = useGameEngine()

const visible = ref(false)
let hideTimer: ReturnType<typeof setTimeout> | null = null

watch(
    () => state.event?.id,
    () => {
        if (!state.event) return
        visible.value = true
        if (hideTimer) clearTimeout(hideTimer)
        hideTimer = setTimeout(() => (visible.value = false), 4200)
    }
)
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300"
    enter-from-class="-translate-y-6 opacity-0"
    leave-active-class="transition-all duration-500"
    leave-to-class="-translate-y-6 opacity-0"
  >
    <div
      v-if="visible && state.event"
      class="absolute top-4 left-1/2 -translate-x-1/2 z-30 rounded-xl px-5 py-3 shadow-2xl border flex items-center gap-3 max-w-[90%]"
      :class="{
        'bg-red-500/90 border-red-300': state.event.type === 'surge',
        'bg-green-600/90 border-green-300': state.event.type === 'crash',
        'bg-orange-600/90 border-orange-300': state.event.type === 'fine',
        'bg-sky-600/90 border-sky-300': state.event.type === 'bonus'
      }"
    >
      <span class="text-2xl">
        {{ state.event.type === 'surge'
          ? '📈'
          : state.event.type === 'crash'
            ? '📉'
            : state.event.type === 'fine'
              ? '⚠️'
              : '🎁' }}
      </span>
      <div class="text-white">
        <div class="text-xs opacity-80 font-bold">
          {{ state.event.type === 'surge'
            ? '突发事件 · 暴涨'
            : state.event.type === 'crash'
              ? '突发事件 · 暴跌'
              : state.event.type === 'fine'
                ? '飞来横祸'
                : '意外之喜' }}
        </div>
        <div class="font-bold">{{ state.event.text }}</div>
      </div>
    </div>
  </Transition>
</template>
