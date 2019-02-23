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
            size: 20,
            picSize: 1,
            moveSpeed: 20,
            moveDuration: 3
        },
        camera: {
            moveSpeed: 10
        },
        collectibles: {
            size: 10,
            picSize: 1
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
        picSize: number,
        moveSpeed: number,
        moveDuration: number
    },
    camera: {
        moveSpeed: number
    },
    collectibles: {
        size: number,
        picSize: number
    }
}