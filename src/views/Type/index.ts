/**
 * 游戏难度
 */
type DifficultyType = 'easy' | 'middle' | 'hard'
/**
 * 游戏状态
 */
type GameStateType = 'init' | 'start' | 'pause' | 'win' | 'lose'
/**
 * 季节（游戏场景）：春夏秋冬
 */
type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter'
/**
 * 道具类型
 */
type ItemIdType = 'coupon' | 'warehouse' | 'intel' | 'amulet' | 'discount'
/**
 * 游戏事件类型
 */
type GameEventType = 'surge' | 'crash' | 'fine' | 'bonus'
/**
 * 日志类型
 */
type LogType = 'info' | 'good' | 'bad' | 'trade'
/**
 * 游戏信息（全局设置）
 */
type GameInfoType = {
    // 游戏难度
    difficulty: DifficultyType;
    // 当前局此
    rounds: number;
    // 游戏状态
    gameState: GameStateType;
    // 背景图片
    bgImage: string;
    // 是否显示游戏日志
    isShowGameInfo: boolean;
    // 游戏日志
    gameLogItems: any[];
}
/**
 * 货物配置
 */
interface GoodsConfig {
    id: string;
    // 货物名称
    name: string;
    // 兜底图标（emoji）
    emoji: string;
    // 所属季节，all 为四季常驻的公共货物
    season: SeasonType | 'all';
    // 金额范围
    min: number;
    max: number;
    // 每回合自然波动幅度，如 0.13 表示 ±13%
    volatility: number;
    // 货物图
    image: string;
}
/**
 * 货物运行时行情
 */
interface GoodsRuntime {
    id: string;
    // 当前价格
    price: number;
    // 上回合价格
    prevPrice: number;
    // 当前季节是否在售
    available: boolean;
    // 本回合事件影响
    eventType?: GameEventType
}
/**
 * 道具配置
 */
interface ItemConfig {
    id: ItemIdType;
    name: string;
    desc: string;
    // 商城售价
    price: number;
    icon: string;
    // 是否为被动道具
    passive: boolean;
    // 单次开局限购数量
    max: number;
}
/**
 * 随机事件
 */
interface GameEvent {
    type: GameEventType;
    // 关联货物（暴涨/暴跌）
    goodsId?: string;
    // 价格倍率
    factor: number;
    // 现金增减数额（罚款/横财）
    amount?: number;
    text: string;
}
/**
 * 播报中的事件
 */
interface ActiveEvent extends GameEvent {
    id: number;
    round: number;
}
/**
 * 游戏日志条目
 */
interface LogEntry {
    id: number;
    round: number;
    text: string;
    type: LogType;
}
/**
 * 排行榜条目
 */
interface LeaderboardEntry {
    id: string;
    name: string;
    difficulty: DifficultyType;
    // 最终净资产
    netWorth: number;
    win: boolean;
    rounds: number;
    date: number;
}

export type {
    DifficultyType,
    GameStateType,
    SeasonType,
    ItemIdType,
    GameEventType,
    LogType,
    GameInfoType,
    GoodsConfig,
    GoodsRuntime,
    ItemConfig,
    GameEvent,
    ActiveEvent,
    LogEntry,
    LeaderboardEntry
}
