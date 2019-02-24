// the game config, can be modified
export let config = {
    canvas: { // canvas settings
        width: 900, // width of the canvas
        height: 500 // height of the canvas
    },
    game: { // game settings
        spellBox: { // settings for the spell box
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
        player: { // player settings
            size: 40, // player size
            colliderSize: 40, // collider size
            moveSpeed: 20, // speed (in pixels per frame)
            moveDuration: 3 // length of a move spell (frames)
        },
        camera: { // camera settings
            moveSpeed: 10 // speed (in pixels per frame)
        },
        collectibles: { // collectibles settings
            size: 40, // picture size
            colliderSize: 40, // collider size
            minNumber: 500, // smallest number of collectibles
            maxNumber: 900 // biggest number of collectibles (inclusive)
        },
        enemies: { // enemy settings
            size: 30, // scale of the picture
            colliderSize: 20, // collider size
            minNumber: 150, // smallest number of enemies
            maxNumber: 200, // biggest number of enemies
            speed: 4, // speed of each enemy
            spawnTimeout: 0.1, // time it takes to create a new enemy (seconds)
            collectibleActivationRadius: 50, // distance to collectible that makes the enemy go to it
            rotationChange: 0.4, // magnitude of the maximum rotation change per frame
            borderEvasionSpeed: 3 // speed with which it evades the borders
        },
        spells: { // spell settings
            protectionLength: 100, // how long the protection ability lasts
            additionalSpells: [ // additional spells
                {
                    name: "kill nearest", // name of the spell
                    execute: `
                        this.enemies.splice(
                            this.enemies
                                .map((x, i) => [x, i])
                                .sort(([a, _a], [b, _b]) =>
                                    a.position.sub(this.playerPosition).len - b.position.sub(this.playerPosition).len
                                )[0][1], 1)
                        return false
                    `,
                    // quoted execute funcition, run in the context of the Game class and with the `n` parameter.
                    // this doesn't get transpiled
                    durability: 2 // durability, same as in Spell
                }
            ]
        },
        world: { // world settings
            width: 7000, // width of the world (pixels)
            height: 5000, // height of the world (pixels)
            tilesize: 512 // size of a tile
        },
        hud: {
            font: "Arial", // font for the hud
            fontSize: 30, // font size
            color: "#636363" // hud color
        },
        keybindings: { // keybindings
            stopTyping: "Escape", // stop typing
            executeSpell: "Enter"
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
        colliderSize: number,
        size: number,
        moveSpeed: number,
        moveDuration: number
    },
    camera: {
        moveSpeed: number
    },
    collectibles: {
        size: number,
        colliderSize: number,
        minNumber: number,
        maxNumber: number
    },
    enemies: {
        size: number,
        colliderSize: number,
        minNumber: number,
        maxNumber: number,
        speed: number,
        spawnTimeout: number,
        collectibleActivationRadius: number,
        rotationChange: number,
        borderEvasionSpeed: number
    },
    spells: {
        protectionLength: number,
        additionalSpells: {
            name: string,
            durability: number,
            execute: string
        }[]
    },
    world: {
        width: number,
        height: number,
        tilesize: number
    },
    hud: {
        font: string,
        fontSize: number,
        color: string
    },
    keybindings: {
        stopTyping: string,
        executeSpell: string
    }
}