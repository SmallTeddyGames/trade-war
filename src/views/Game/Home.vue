<script lang="ts" setup>
import {computed} from 'vue'
import GameNav from "@/views/Layout/GameNav.vue";
import GameContent from '@/views/Layout/GameContent.vue'
import {SEASON_MAP} from '@/game/config'
import {useGameEngine} from '@/game/useGame'
import {useGeneratedImage} from '@/game/useGeneratedImage'
import {getAssetsFile} from '@/utils'

const {state} = useGameEngine()

// 对局中使用当季场景图，开局前使用默认背景
const seasonUrl = computed(() =>
    state.gameState === 'init' ? '' : SEASON_MAP[state.season].bg
)
// 文生图首次返回占位图，自动探测刷新真图
const {displayUrl: seasonImage} = useGeneratedImage(seasonUrl)

const backgroundImage = computed(() => {
    const fallback = getAssetsFile('game-bg.jpg')
    return seasonImage.value ? `url('${seasonImage.value}'), url(${fallback})` : `url(${fallback})`
})
</script>

<template>
  <main class="relative h-100dvh w-full of-hidden overflow-x-hidden bg-cover bg-center grid grid-rows-[max-content_1fr]"
        :style="{ backgroundImage }">
    <!-- 背景压暗遮罩，降低背景图对卡片与文字的干扰 -->
    <div absolute inset-0 bg-black-55 pointer-events-none />
    <GameNav class="relative z-10" />
    <GameContent class="relative z-10" />
  </main>
</template>
