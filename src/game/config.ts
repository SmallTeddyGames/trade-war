import type {
    DifficultyType,
    GoodsConfig,
    ItemConfig,
    SeasonType
} from '@/views/Type'

/**
 * 文生图资源地址
 */
const img = (prompt: string, size: 'square_hd' | 'landscape_16_9' = 'square_hd'): string =>
    `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${size}`

/**
 * 全局回合规则：共 24 回合，对应二十四节气，每季 6 个回合
 */
export const MAX_ROUNDS = 24
export const ROUND_SECONDS = 60
export const ROUNDS_PER_SEASON = 6

/**
 * 二十四节气（按时间顺序，与回合 1~24 一一对应，每季 6 个）
 */
export const SOLAR_TERMS: string[] = [
    // 春
    '立春', '雨水', '惊蛰', '春分', '清明', '谷雨',
    // 夏
    '立夏', '小满', '芒种', '夏至', '小暑', '大暑',
    // 秋
    '立秋', '处暑', '白露', '秋分', '寒露', '霜降',
    // 冬
    '立冬', '小雪', '大雪', '冬至', '小寒', '大寒'
]

/**
 * 当前回合对应的节气名
 */
export const termOfRound = (round: number): string =>
    SOLAR_TERMS[Math.min(MAX_ROUNDS, Math.max(1, round)) - 1] ?? '立春'

/**
 * 四个游戏场景：春夏秋冬
 */
export interface SeasonConfig {
    id: SeasonType
    name: string
    emoji: string
    tagline: string
    bg: string
}

export const SEASON_LIST: SeasonConfig[] = [
    {
        id: 'spring',
        name: '春',
        emoji: '🌸',
        tagline: '万物生发',
        bg: img('ancient Chinese trade town in spring, peach blossom trees, misty mountains, cinematic ink wash painting style, wide game background, no text', 'landscape_16_9')
    },
    {
        id: 'summer',
        name: '夏',
        emoji: '☀️',
        tagline: '烈日炎炎',
        bg: img('ancient Chinese trade town in summer, lotus pond, lush green trees, bright sunlight, cinematic ink wash painting style, wide game background, no text', 'landscape_16_9')
    },
    {
        id: 'autumn',
        name: '秋',
        emoji: '🍁',
        tagline: '丰收之时',
        bg: img('ancient Chinese trade town in autumn, golden ginkgo and red maple leaves, harvest market, cinematic ink wash painting style, wide game background, no text', 'landscape_16_9')
    },
    {
        id: 'winter',
        name: '冬',
        emoji: '❄️',
        tagline: '岁末寒冬',
        bg: img('ancient Chinese trade town in winter, snow covered roofs, red plum blossom, cold blue sky, cinematic ink wash painting style, wide game background, no text', 'landscape_16_9')
    }
]

export const SEASON_MAP: Record<SeasonType, SeasonConfig> = Object.fromEntries(
    SEASON_LIST.map(s => [s.id, s])
) as Record<SeasonType, SeasonConfig>

/**
 * 根据回合数推算季节（每 6 回合换一季，与二十四节气对齐）
 */
export const seasonOfRound = (round: number): SeasonType => {
    const index = Math.floor((round - 1) / ROUNDS_PER_SEASON)
    return SEASON_LIST[Math.min(index, SEASON_LIST.length - 1)]?.id ?? 'winter'
}

/**
 * 游戏难度
 */
export interface DifficultyConfig {
    label: string
    desc: string
    // 初始资金
    cash: number
    // 仓库容量
    capacity: number
    // 随机事件触发概率
    eventRate: number
}

export const DIFFICULTY_MAP: Record<DifficultyType, DifficultyConfig> = {
    easy: {label: '轻松', desc: '本金充裕，风波较少', cash: 10000, capacity: 100, eventRate: 0.35},
    middle: {label: '普通', desc: '小本经营，涨跌难料', cash: 6000, capacity: 60, eventRate: 0.45},
    hard: {label: '艰难', desc: '捉襟见肘，危机四伏', cash: 3000, capacity: 40, eventRate: 0.6}
}

/**
 * 货物图：所有货物使用完全一致的画面规范，保证 24 张图风格统一
 * （单一主体居中 + 深暖炭棕背景 + 柔和轮廓光 + 游戏卡牌数字手绘风）
 */
const goodsImg = (subject: string): string => img(
    `${subject}, centered single subject product shot, symmetrical composition, dark warm charcoal brown gradient background, soft rim light from upper left, ancient Chinese merchant trade commodity, stylized digital painting game card icon art, highly detailed, no text, no watermark, no people, no hands, no scenery`
)

/**
 * 无底板版：部分主体容易被模型画在带金边的卡牌/牌匾上，
 * 使用更强的反向约束，确保与其它货物一样为纯净深棕渐变背景
 */
const goodsImgPlain = (subject: string): string => img(
    `${subject}, centered single subject product shot, symmetrical composition, plain empty smooth dark warm charcoal brown gradient studio backdrop, soft rim light from upper left, ancient Chinese merchant trade commodity, stylized digital painting icon, highly detailed. IMPORTANT the object floats directly on the plain gradient background: no card, no tile, no plaque, no panel, no board, no slab, no wall, no painting, no shelf, no frame, no border, no rectangle and no ornament of any kind behind or around the object, no text, no watermark, no people, no hands, no scenery`
)

/**
 * 货物设计：8 种公共货物 + 每季 4 种环境特有货物，共 24 种
 */
export const GOODS_LIST: GoodsConfig[] = [
    // —— 公共货物，四季皆有 ——
    {id: 'salt', name: '食盐', emoji: '🧂', season: 'all', min: 100, max: 300, volatility: 0.13, image: goodsImg('one tied burlap sack of white salt with a few salt grains beside it')},
    {id: 'iron', name: '铁器', emoji: '🔩', season: 'all', min: 200, max: 450, volatility: 0.13, image: goodsImg('a neat stack of ancient iron ingots with a hammer and a knife')},
    {id: 'grain', name: '粮食', emoji: '🌾', season: 'all', min: 60, max: 220, volatility: 0.13, image: goodsImg('two burlap sacks of rice and wheat with a bundle of wheat ears')},
    {id: 'tea', name: '茶叶', emoji: '🍵', season: 'all', min: 180, max: 560, volatility: 0.13, image: goodsImg('a ceramic bowl full of dried Chinese tea leaves with a few leaves scattered')},
    {id: 'silk', name: '丝绸', emoji: '🧵', season: 'all', min: 420, max: 950, volatility: 0.13, image: goodsImg('two rolled bolts of elegant red and teal silk fabric standing upright')},
    {id: 'porcelain', name: '瓷器', emoji: '🏺', season: 'all', min: 520, max: 1300, volatility: 0.13, image: goodsImg('a single blue and white Chinese porcelain vase with floral patterns')},
    {id: 'lacquer', name: '漆器', emoji: '🍶', season: 'all', min: 260, max: 720, volatility: 0.13, image: goodsImg('a single glossy black and red carved lacquerware flask')},
    {id: 'jade', name: '玉石', emoji: '💠', season: 'all', min: 600, max: 1500, volatility: 0.13, image: goodsImgPlain('a single carved pale green jade pendant ornament with two small raw jade stones beside it')},
    // —— 春季特有 ——
    {id: 'flower', name: '鲜花', emoji: '💐', season: 'spring', min: 80, max: 260, volatility: 0.22, image: goodsImgPlain('a small plain clay vase holding fresh pink peach blossom branches with green leaves')},
    {id: 'ming-tea', name: '明前茶', emoji: '🍃', season: 'spring', min: 620, max: 1500, volatility: 0.22, image: goodsImg('a single sealed elegant celadon ceramic jar of premium Mingqian green tea')},
    {id: 'bamboo-shoot', name: '春笋', emoji: '🎋', season: 'spring', min: 60, max: 180, volatility: 0.22, image: goodsImgPlain('three fresh green spring bamboo shoots stacked together')},
    {id: 'honey', name: '蜂蜜', emoji: '🍯', season: 'spring', min: 260, max: 640, volatility: 0.22, image: goodsImgPlain('one small clay jar of golden honey with a wooden honey dipper resting on its rim')},
    // —— 夏季特有 ——
    {id: 'lychee', name: '荔枝', emoji: '🍒', season: 'summer', min: 220, max: 560, volatility: 0.22, image: goodsImg('a pile of red lychee fruits heaped in a shallow bamboo basket')},
    {id: 'pearl', name: '珍珠', emoji: '📿', season: 'summer', min: 650, max: 1600, volatility: 0.22, image: goodsImg('a string of shining white freshwater pearls resting on a half oyster shell')},
    {id: 'ramie', name: '夏布', emoji: '🧶', season: 'summer', min: 180, max: 480, volatility: 0.22, image: goodsImg('two folded rolls of natural beige ramie linen fabric')},
    {id: 'watermelon', name: '西瓜', emoji: '🍉', season: 'summer', min: 40, max: 150, volatility: 0.22, image: goodsImg('one whole green watermelon with a cut wedge showing red flesh')},
    // —— 秋季特有 ——
    {id: 'wine', name: '葡萄酒', emoji: '🍷', season: 'autumn', min: 320, max: 850, volatility: 0.22, image: goodsImg('one sealed clay wine jar with a cup of red grape wine')},
    {id: 'spice', name: '香料', emoji: '🌶️', season: 'autumn', min: 380, max: 980, volatility: 0.22, image: goodsImg('a small pile of dried star anise cinnamon sticks and red peppers in a wooden tray')},
    {id: 'cotton', name: '棉花', emoji: '☁️', season: 'autumn', min: 120, max: 360, volatility: 0.22, image: goodsImg('three fluffy white raw cotton bolls stacked together')},
    {id: 'tobacco', name: '烟草', emoji: '🚬', season: 'autumn', min: 380, max: 950, volatility: 0.22, image: goodsImg('a bundle of dried brown tobacco leaves tied with rope')},
    // —— 冬季特有 ——
    {id: 'fur', name: '皮毛', emoji: '🦊', season: 'winter', min: 420, max: 1050, volatility: 0.22, image: goodsImg('a neat stack of folded warm brown and white animal furs')},
    {id: 'ginseng', name: '人参', emoji: '🌿', season: 'winter', min: 720, max: 1850, volatility: 0.22, image: goodsImgPlain('one dried forked ginseng root with a few tiny red berries beside it, traditional Chinese herbal medicine')},
    {id: 'coal', name: '煤炭', emoji: '🪨', season: 'winter', min: 50, max: 200, volatility: 0.22, image: goodsImg('a heap of black coal briquettes stacked together')},
    {id: 'bacon', name: '腊肉', emoji: '🥓', season: 'winter', min: 220, max: 560, volatility: 0.22, image: goodsImgPlain('a bunch of cured waxed pork belly strips hanging from a thin wooden stick')}
]

export const GOODS_MAP: Record<string, GoodsConfig> = Object.fromEntries(
    GOODS_LIST.map(g => [g.id, g])
)

/**
 * 当季在售货物（公共货物 + 当季特有货物）
 */
export const marketGoodsOf = (season: SeasonType): GoodsConfig[] =>
    GOODS_LIST.filter(g => g.season === 'all' || g.season === season)

/**
 * 游戏道具（开局道具商城）
 */
export const ITEMS_LIST: ItemConfig[] = [
    {id: 'coupon', name: '银票', desc: '对局中随时兑现，立即获得 2000 两', price: 1000, icon: 'i-mdi-cash-multiple', passive: false, max: 3},
    {id: 'warehouse', name: '仓库契书', desc: '仓库容量永久 +50', price: 800, icon: 'i-mdi-warehouse', passive: true, max: 1},
    {id: 'intel', name: '小道消息', desc: '提前获知下一回合的市场事件', price: 600, icon: 'i-mdi-information-outline', passive: false, max: 3},
    {id: 'amulet', name: '护身符', desc: '即将破产时自动获得 1500 两救济', price: 1200, icon: 'i-mdi-shield-check', passive: true, max: 1},
    {id: 'discount', name: '折扣令牌', desc: '整局买入价格 -5%', price: 1500, icon: 'i-mdi-tag', passive: true, max: 1}
]

export const ITEMS_MAP: Record<string, ItemConfig> = Object.fromEntries(
    ITEMS_LIST.map(i => [i.id, i])
)

/**
 * 随机事件文案模板
 */
export const SURGE_TEXTS: string[] = [
    '富商重金囤积「{name}」，市价扶摇直上！',
    '官道临时封闭，「{name}」货源紧缺，价格暴涨！',
    '西域商队大举收购「{name}」，价格暴涨！'
]

export const CRASH_TEXTS: string[] = [
    '今年风调雨顺，「{name}」集中上市，价格暴跌！',
    '西洋商船大批倾销「{name}」，价格暴跌！',
    '坊间传出「{name}」成色掺假，价格暴跌！'
]

export const FINE_TEXTS: string[] = [
    '官府加征商税，被迫缴纳 {amount} 两！',
    '路途遭遇盗匪，损失货银 {amount} 两！'
]

export const BONUS_TEXTS: string[] = [
    '途中拾得遗金，进账 {amount} 两！',
    '贵人出手大方，赏银 {amount} 两！',
    '转手一批私货，获利 {amount} 两！'
]
