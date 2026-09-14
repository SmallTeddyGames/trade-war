import {computed, onUnmounted, ref, toValue, watch, type MaybeRefOrGetter} from 'vue'

/**
 * 文生图资源为异步生成：首次请求会先返回「生成中」占位图，
 * 生成完成后再次请求才能拿到真图。该函数定时探测，
 * 一旦探测到图片尺寸变化（说明真图已生成）就刷新展示地址。
 *
 * @param source 图片地址（字符串、Ref 或 getter）
 * @param maxRetry 最多探测次数
 * @param interval 探测间隔毫秒
 */
export const useGeneratedImage = (
    source: MaybeRefOrGetter<string>,
    maxRetry = 12,
    interval = 6000
) => {
    const urlRef = computed(() => toValue(source))
    const displayUrl = ref(urlRef.value)

    let timer: ReturnType<typeof setTimeout> | null = null
    let attempts = 0
    let baselineW = 0
    let baselineH = 0
    let version = 0
    let alive = true

    const clearTimer = () => {
        if (timer) {
            clearTimeout(timer)
            timer = null
        }
    }

    const bump = () => {
        version++
        displayUrl.value = `${urlRef.value}${urlRef.value.includes('?') ? '&' : '?'}_v=${version}`
    }

    const schedule = () => {
        clearTimer()
        if (!alive || attempts >= maxRetry) return
        timer = setTimeout(runProbe, interval)
    }

    const runProbe = () => {
        if (!alive) return
        attempts++
        const probe = new Image()
        probe.onload = () => {
            if (!alive) return
            if (baselineW === 0) {
                baselineW = probe.naturalWidth
                baselineH = probe.naturalHeight
            }
            const changed = probe.naturalWidth !== baselineW || probe.naturalHeight !== baselineH
            if (changed) {
                bump()
                return
            }
            // 最后一次仍未变化，强制刷新一次（真图与占位图尺寸可能恰好相同）
            if (attempts >= maxRetry) {
                bump()
                return
            }
            schedule()
        }
        probe.onerror = () => schedule()
        probe.src = `${urlRef.value}${urlRef.value.includes('?') ? '&' : '?'}_p=${attempts}&t=${Date.now()}`
    }

    watch(urlRef, newUrl => {
        clearTimer()
        attempts = 0
        baselineW = 0
        baselineH = 0
        version = 0
        displayUrl.value = newUrl
        if (newUrl) runProbe()
    })

    if (urlRef.value) runProbe()

    onUnmounted(() => {
        alive = false
        clearTimer()
    })

    return {displayUrl}
}
