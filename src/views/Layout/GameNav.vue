<script setup lang="ts">
import ChangeGameStatus from '@/views/NavButton/ChangeGameStatus.vue'
import GitHubButton from '@/views/NavButton/GitHubButton.vue'
import ColorSchemeToggle from '@/views/NavButton/ColorSchemeToggle.vue'
import FullScreenToggle from '@/views/NavButton/FullScreenToggle.vue'
</script>

<template>
  <nav class="w-screen px-4 py-3 text-lg text-white bg-zinc-900/70 backdrop-blur-sm border-b border-white/10 flex gap-1 items-center">
    <div title="Game">Trade War</div>
    <div flex-auto></div>
    <!-- 游戏控制按钮 -->
    <ChangeGameStatus />
    <!-- github按钮 -->
    <GitHubButton />
    <!-- 颜色切换按钮 -->
    <ColorSchemeToggle />
    <!-- 全屏按钮 -->
    <FullScreenToggle />
  </nav>
</template>
