export let config = {
    canvas: {
        width: 900,
        height: 500
    },
    game: {}
}

export type Config = {
    canvas: {
        width: number,
        height: number
    },
    game: GameConfig
}

export type GameConfig = {}