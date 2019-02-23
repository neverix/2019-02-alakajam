export let config = {
    canvas: {
        width: 900,
        height: 500
    },
    game: {
        spellBox: {
            font: "Arial",
            fontSize: 30,
            boxSize: 45,
            widthPercent: 60,
            verticalOffset: 30,
            textPadding: 5,
            backgroundColor: "#f4f4f4",
            foregroundColor: "#757a82",
            autocompleteBackgroundColor: "#7c796b",
            autocompleteForegroundColor: "#eaeaea"
        },
        player: {
            size: 40,
            moveSpeed: 50,
            moveDuration: 3
        }
    }
}

export type Config = {
    canvas: {
        width: number,
        height: number
    },
    game: GameConfig
}

export type GameConfig = {
    spellBox: {
        font: string,
        fontSize: number,
        boxSize: number,
        widthPercent: number,
        verticalOffset: number,
        textPadding: number,
        backgroundColor: string,
        foregroundColor: string,
        autocompleteBackgroundColor: string,
        autocompleteForegroundColor: string
    },
    player: {
        size: number,
        moveSpeed: number,
        moveDuration: number
    }
}