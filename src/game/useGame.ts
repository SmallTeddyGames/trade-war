import {createGlobalState, useStorage} from '@vueuse/core'
import {
    BONUS_TEXTS,
    CRASH_TEXTS,
    DIFFICULTY_MAP,
    FINE_TEXTS,
    GOODS_LIST,
    GOODS_MAP,
    ITEMS_LIST,
    MAX_ROUNDS,
    ROUND_SECONDS,
    SURGE_TEXTS,
    marketGoodsOf,
    seasonOfRound,
    termOfRound
} from '@/game/config'
import type {
    ActiveEvent,
    DifficultyType,
    GameEvent,
    GameStateType,
    GoodsRuntime,
    ItemIdType,
    LeaderboardEntry,
    LogEntry,
    LogType,
    SeasonType
} from '@/views/Type'

const rand = (min: number, max: number): number => Math.round(min + Math.random() * (max - min))
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value))
const fill = (text: string, params: Record<string, string | number>): string =>
    text.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? ''))

/**
 * 单局游戏的响应式状态结构
 */
interface GameStateShape {
    gameState: GameStateType
    difficulty: DifficultyType
    round: number
    countdown: number
    season: SeasonType
    cash: number
    capacity: number
    holdings: Record<string, number>
    items: Record<ItemIdType, number>
    goods: Record<string, GoodsRuntime>
    event: ActiveEvent | null
    pendingEvent: GameEvent | null
    intelTip: string
    logs: LogEntry[]
    finalNetWorth: number
}

const createInitialState = (): GameStateShape => ({
    gameState: 'init',
    difficulty: 'middle',
    round: 0,
    countdown: ROUND_SECONDS,
    season: 'spring',
    cash: 0,
    capacity: 0,
    holdings: {},
    items: {coupon: 0, warehouse: 0, intel: 0, amulet: 0, discount: 0},
    goods: {},
    event: null,
    pendingEvent: null,
    intelTip: '',
    logs: [],
    finalNetWorth: 0
})

export const useGameEngine = createGlobalState(() => {
    // 排行榜持久化
    const leaderboard = useStorage<LeaderboardEntry[]>('trade-war-leaderboard', [])
    const lastSavedId = ref<string>('')

    const state = reactive<GameStateShape>(createInitialState())

    let timer: ReturnType<typeof setInterval> | null = null
    let logSeq = 0
    let eventSeq = 0

    /**
     * 写一条游戏日志
     */
    const addLog = (text: string, type: LogType = 'info') => {
        state.logs.push({id: ++logSeq, round: state.round, text, type})
        if (state.logs.length > 80) state.logs.shift()
    }

    /**
     * 当前季节市场上的货物
     */
    const marketGoods = () => marketGoodsOf(state.season)

    /**
     * 生成随机事件（无事件返回 null）
     */
    const rollEvent = (season: SeasonType): GameEvent | null => {
        if (Math.random() > DIFFICULTY_MAP[state.difficulty].eventRate) return null

        const roll = Math.random()
        if (roll < 0.35) {
            const goods = pick(marketGoodsOf(season))
            const factor = rand(170, 220) / 100
            return {
                type: 'surge',
                goodsId: goods.id,
                factor,
                text: fill(pick(SURGE_TEXTS), {name: goods.name})
            }
        }
        if (roll < 0.7) {
            const goods = pick(marketGoodsOf(season))
            const factor = rand(35, 55) / 100
            return {
                type: 'crash',
                goodsId: goods.id,
                factor,
                text: fill(pick(CRASH_TEXTS), {name: goods.name})
            }
        }
        if (roll < 0.86) {
            // 加税固定 800；盗匪损失现金 10%，最少 200
            const isTax = Math.random() < 0.5
            const amount = isTax ? 800 : Math.max(200, Math.round(state.cash * 0.1))
            return {
                type: 'fine',
                factor: 1,
                amount,
                text: fill(pick(FINE_TEXTS), {amount})
            }
        }
        const amount = rand(500, 1200)
        return {
            type: 'bonus',
            factor: 1,
            amount,
            text: fill(pick(BONUS_TEXTS), {amount})
        }
    }

    /**
     * 每回合行情滚动
     */
    const rollPrices = (event: GameEvent | null) => {
        const inMarket = new Set(marketGoods().map(g => g.id))
        for (const cfg of GOODS_LIST) {
            const old = state.goods[cfg.id]
            if (!inMarket.has(cfg.id)) {
                if (old) {
                    old.available = false
                    old.eventType = undefined
                }
                continue
            }

            const prev = old?.price
            let price: number
            if (prev) {
                const drift = 1 + (Math.random() * 2 - 1) * cfg.volatility
                price = clamp(Math.round(prev * drift), cfg.min, cfg.max)
            } else {
                price = rand(cfg.min, cfg.max)
            }

            let eventType: GameEvent['type'] | undefined
            if (event && event.goodsId === cfg.id && (event.type === 'surge' || event.type === 'crash')) {
                price = clamp(
                    Math.round(price * event.factor),
                    Math.round(cfg.min * 0.5),
                    Math.round(cfg.max * 1.5)
                )
                eventType = event.type
            }

            state.goods[cfg.id] = {
                id: cfg.id,
                price,
                prevPrice: prev ?? price,
                available: true,
                eventType
            }
        }
    }

    /**
     * 货物估值：在售按市价，过季按半价回收
     */
    const unitValue = (goodsId: string): number => {
        const cfg = GOODS_MAP[goodsId]
        const rt = state.goods[goodsId]
        if (!cfg) return 0
        if (!rt) return Math.round(cfg.min * 0.5)
        return rt.available ? rt.price : Math.max(1, Math.round(rt.price * 0.5))
    }

    const holdingsValue = (): number =>
        Object.entries(state.holdings).reduce((sum, [id, qty]) => sum + unitValue(id) * qty, 0)

    const usedCapacity = (): number =>
        Object.values(state.holdings).reduce((sum, qty) => sum + qty, 0)

    const calcNetWorth = (): number => state.cash + holdingsValue()

    /**
     * 破产判定：身无分文且无货可变卖
     */
    const checkBankrupt = () => {
        if (state.gameState !== 'start') return
        if (state.cash > 0 || usedCapacity() > 0) return

        if (state.items.amulet > 0) {
            state.items.amulet--
            state.cash = 1500
            addLog('护身符灵光乍现，获得 1500 两救济金！', 'good')
            return
        }
        endGame('lose')
    }

    /**
     * 应用回合事件
     */
    const applyEvent = (event: GameEvent | null) => {
        if (!event) return
        state.event = {...event, id: ++eventSeq, round: state.round}
        if (event.type === 'surge' || event.type === 'crash') {
            addLog(event.text, event.type === 'surge' ? 'good' : 'bad')
        } else if (event.type === 'bonus') {
            state.cash += event.amount ?? 0
            addLog(event.text, 'good')
        } else {
            state.cash = Math.max(0, state.cash - (event.amount ?? 0))
            addLog(event.text, 'bad')
            checkBankrupt()
        }
    }

    /**
     * 进入指定回合
     */
    const startRound = (round: number) => {
        state.round = round
        state.season = seasonOfRound(round)
        const event = state.pendingEvent ?? rollEvent(state.season)
        state.pendingEvent = null
        state.intelTip = ''
        rollPrices(event)
        applyEvent(event)
        state.countdown = ROUND_SECONDS
        const seasonName = state.season === 'spring' ? '春' : state.season === 'summer' ? '夏' : state.season === 'autumn' ? '秋' : '冬'
        addLog(`第 ${round} 回合「${termOfRound(round)}」开始，时值${seasonName}季。`, 'info')
    }

    /**
     * 倒计时结束或手动进入下一回合
     */
    const advanceRound = () => {
        if (state.gameState !== 'start') return
        if (state.round >= MAX_ROUNDS) {
            endGame(state.cash > 0 ? 'win' : 'lose')
            return
        }
        startRound(state.round + 1)
    }

    const tick = () => {
        if (state.gameState !== 'start') return
        state.countdown--
        if (state.countdown <= 0) advanceRound()
    }

    const stopTimer = () => {
        if (timer) {
            clearInterval(timer)
            timer = null
        }
    }

    /**
     * 结束本局
     */
    function endGame(result: 'win' | 'lose') {
        stopTimer()
        state.gameState = result
        state.finalNetWorth = calcNetWorth()
        addLog(result === 'win' ? `${MAX_ROUNDS} 回合（二十四节气）期满，以 ${state.finalNetWorth} 两净资产全身而退！` : '债台高筑，商路就此断绝……', result === 'win' ? 'good' : 'bad')
    }

    /**
     * 买入货物
     */
    const buy = (goodsId: string, qty: number): boolean => {
        if (state.gameState !== 'start' || qty <= 0) return false
        const rt = state.goods[goodsId]
        if (!rt || !rt.available) return false

        const unit = Math.round(rt.price * (state.items.discount > 0 ? 0.95 : 1))
        const cost = unit * qty
        if (usedCapacity() + qty > state.capacity) {
            addLog('仓库已满，无法继续买入！', 'bad')
            return false
        }
        if (state.cash < cost) {
            addLog('银两不足，买入失败！', 'bad')
            return false
        }

        state.cash -= cost
        state.holdings[goodsId] = (state.holdings[goodsId] ?? 0) + qty
        addLog(`买入 ${GOODS_MAP[goodsId].name} ×${qty}，花费 ${cost} 两`, 'trade')
        return true
    }

    /**
     * 卖出货物（当季按市价）
     */
    const sell = (goodsId: string, qty: number): boolean => {
        if (state.gameState !== 'start' || qty <= 0) return false
        const held = state.holdings[goodsId] ?? 0
        const rt = state.goods[goodsId]
        if (!held || !rt || !rt.available) return false

        const realQty = Math.min(qty, held)
        const income = rt.price * realQty
        state.cash += income
        state.holdings[goodsId] = held - realQty
        addLog(`卖出 ${GOODS_MAP[goodsId].name} ×${realQty}，收入 ${income} 两`, 'trade')
        return true
    }

    /**
     * 过季货物半价回收
     */
    const recycle = (goodsId: string): boolean => {
        if (state.gameState !== 'start') return false
        const held = state.holdings[goodsId] ?? 0
        const rt = state.goods[goodsId]
        if (!held || !rt || rt.available) return false

        const unit = Math.max(1, Math.round(rt.price * 0.5))
        const income = unit * held
        state.cash += income
        state.holdings[goodsId] = 0
        addLog(`将过季的 ${GOODS_MAP[goodsId].name} ×${held} 半价回收，收入 ${income} 两`, 'trade')
        return true
    }

    /**
     * 使用银票：立即兑现 2000 两
     */
    const useCoupon = () => {
        if (state.gameState !== 'start' || state.items.coupon <= 0) return
        state.items.coupon--
        state.cash += 2000
        addLog('兑现银票，获得 2000 两！', 'good')
    }

    /**
     * 使用小道消息：预滚下一回合事件
     */
    const useIntel = () => {
        if (state.gameState !== 'start' || state.items.intel <= 0) return
        if (state.round >= MAX_ROUNDS) {
            addLog('已是最后一回合，无需打探消息。', 'info')
            return
        }
        state.items.intel--
        const nextSeason = seasonOfRound(state.round + 1)
        const event = rollEvent(nextSeason)
        state.pendingEvent = event
        state.intelTip = event ? `密报：下一回合——${event.text}` : '密报：下一回合风平浪静。'
        addLog('散布银钱打探消息，获知下回合行情动向。', 'info')
    }

    /**
     * 开局：难度 + 商城购物车
     */
    const startGame = (difficulty: DifficultyType, cart: Record<ItemIdType, number>) => {
        stopTimer()
        Object.assign(state, createInitialState())

        const d = DIFFICULTY_MAP[difficulty]
        state.gameState = 'start'
        state.difficulty = difficulty
        state.cash = d.cash
        state.capacity = d.capacity + (cart.warehouse > 0 ? 50 : 0)
        for (const item of ITEMS_LIST) state.items[item.id] = cart[item.id] ?? 0

        addLog(`商路开张！难度「${d.label}」，携 ${d.cash} 两本金入市，共 ${MAX_ROUNDS} 回合。`, 'info')
        startRound(1)
        timer = setInterval(tick, 1000)
    }

    /**
     * 暂停 / 继续
     */
    const togglePause = () => {
        if (state.gameState === 'start') state.gameState = 'pause'
        else if (state.gameState === 'pause') state.gameState = 'start'
    }

    /**
     * 返回首页（放弃本局）
     */
    const restart = () => {
        stopTimer()
        Object.assign(state, createInitialState())
    }

    /**
     * 结算后保存成绩到排行榜
     */
    const saveScore = (name: string): boolean => {
        if (state.gameState !== 'win' && state.gameState !== 'lose') return false
        const entry: LeaderboardEntry = {
            id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            name: name.trim() || '无名商人',
            difficulty: state.difficulty,
            netWorth: state.finalNetWorth,
            win: state.gameState === 'win',
            rounds: state.round,
            date: Date.now()
        }
        leaderboard.value = [entry, ...leaderboard.value]
            .sort((a, b) => b.netWorth - a.netWorth)
            .slice(0, 10)
        lastSavedId.value = entry.id
        return true
    }

    return {
        state,
        leaderboard,
        lastSavedId,
        marketGoods,
        unitValue,
        holdingsValue,
        usedCapacity,
        calcNetWorth,
        startGame,
        advanceRound,
        buy,
        sell,
        recycle,
        useCoupon,
        useIntel,
        togglePause,
        restart,
        saveScore
    }
})
