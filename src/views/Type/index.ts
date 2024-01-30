export type GameStateType = {
    // 游戏难度
    difficulty: 'easy' | 'middle' | 'hard';
    // 当前局此
    rounds: number;
    // 游戏状态
    gameState: 'init' |'start' | 'pause' | 'win' | 'lose';
    // 背景图片
    bgImage: string;
    // 是否显示游戏日志
    isShowGameInfo: boolean;
    // 游戏日志(Todo: 数据结构待定)
    gameLogItems: any[];
}