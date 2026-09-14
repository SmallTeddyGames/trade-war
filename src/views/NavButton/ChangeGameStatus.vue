<script lang='ts' setup>
import {useGameEngine} from '@/game/useGame'

const {state, togglePause} = useGameEngine()
</script>

<template>
  <button
    v-if="state.gameState === 'start' || state.gameState === 'pause'"
    rounded p-2 hover:bg-active title="暂停 / 继续"
    @click="togglePause"
  >
    <div
      :class="{
        'i-material-symbols:play-circle-rounded': state.gameState === 'pause',
        'i-material-symbols:pause-circle': state.gameState === 'start'
      }"
      text-2xl
    />
  </button>
</template>
