// the game config, can be modified
export let config = {
    canvas: {
        width: 900, // width of the canvas
        height: 500 // height of the canvas
    },
    game: {
        spellBox: {
            font: "Arial", // font to be used
            fontSize: 30, // the font size
            boxSize: 45, // vertical size of the box
            widthPercent: 60, // percentage of the game field's width that the box occupies
            verticalOffset: 30, // the vertical offset from the top (% of height)
            textPadding: 5, // horizontal padding of the text
            backgroundColor: "#f4f4f4", // background color
            foregroundColor: "#757a82", // foreground (text) color
            autocompleteBackgroundColor: "#7c796b", // background color of the autocomplete menu
            autocompleteForegroundColor: "#eaeaea" // foreground (text) color of the autocomplete menu
        },
        player: {
            size: 22, // picture scale
            picSize: 1, // size of the original picture
            moveSpeed: 20, // speed (in pixels per frame)
            moveDuration: 3 // length of a move spell (frames)
        },
        camera: {
            moveSpeed: 10 // speed (in pixels per frame)
        },
        collectibles: {
            size: 12, // scale of the picture
            picSize: 1, // original picture size
            minNumber: 10, // smallest number of collectibles
            maxNumber: 15 // biggest number of collectibles (inclusive)
        },
        world: {
            width: 900, // width of the world (pixels)
            height: 500 // height of the world (pixels)
        },
        hud: {
            font: "Arial", // font for the hud
            fontSize: 30, // font size
            color: "#f4f4f4" // hud color
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
        picSize: number,
        minNumber: number,
        maxNumber: number
    },
    world: {
        width: number,
        height: number
    },
    hud: {
        font: string,
        fontSize: number,
        color: string
    }
}