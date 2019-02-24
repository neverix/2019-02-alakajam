import { GameConfig, config } from './config'
import Spell from './spell'
import Vector from './vector'
import Collectible from './collectible'
import Enemy from './enemy'

export class Game {
    // game config
    private config: GameConfig
    // the current spell
    private spell: string[] = []
    // this is the number of characters that were typed in the previous frames.
    // we consider characters after this index to be typed during the current frame.
    private charactersTypedPreviousFrames: number = 0
    // player position
    private playerPosition: Vector = new Vector(0, 0)
    // list of currently executing spells
    private spellQueue: { duration: number, spell: Spell }[] = []
    // list of all spells
    private spells: Spell[] = []
    // camera postion
    private cameraPosition: Vector = new Vector()
    // list of collectibles
    private collectibles: Collectible[] = []
    // total number of collectibles
    private numberOfCollectibles: number
    // enemies
    private enemies: Enemy[] = []
    // game over callback
    private gameOver: () => void = () => { }
    // spells for collectibles
    private collectiblesSpells: Spell[]
    // player protection
    private isPlayerProtected: boolean = false

    constructor(config: GameConfig) {
        this.config = config
        // spells for moving
        let directions: { [dir: string]: [number, number] } = {
            back: [0, -1],
            front: [0, 1],
            left: [-1, 0],
            right: [1, 0]
        }
        for (let dir in directions) {
            // get normalized x and y velocity
            let [x, y] = directions[dir]

            // generate the spell
            this.addSpell(
                {
                    name: dir,
                    execute: (n: number) => {
                        if (n <= config.player.moveDuration) {
                            this.playerPosition.x += config.player.moveSpeed * x
                            this.playerPosition.y += config.player.moveSpeed * y
                            return true
                        }
                    },
                    durability: Infinity
                })
        }

        // lowercase the spell names
        this.spells.forEach(spell => {
            spell.name = spell.name.toLowerCase()
        })

        // set up spells for collectibles
        this.collectiblesSpells = [
            {
                name: "kill nearest",
                execute: (_n: number) => {
                    this.enemies.splice(
                        this.enemies
                            .map((x, i): [Enemy, number] => [x, i])
                            .sort(([a, _a], [b, _b]) =>
                                a.position.sub(this.playerPosition).len - b.position.sub(this.playerPosition).len
                            )[0][1], 1)
                    return false
                },
                durability: 3
            },
            {
                name: "protection",
                execute: (n: number) => {
                    if (n >= this.config.spells.protectionLength) {
                        this.isPlayerProtected = false
                        return false
                    }
                    this.isPlayerProtected = true
                    return true
                },
                durability: 2
            }
        ]
        // add spells from config
        config.spells.additionalSpells.forEach(additionalSpell => {
            let executeFunction = Function("n", additionalSpell.execute).bind(this)
            let newSpell = Object.assign({}, additionalSpell, { execute: executeFunction })
            this.collectiblesSpells.push(newSpell)
        })

        // generate collectibles
        // pick a random number of collectibles
        this.numberOfCollectibles =
            config.collectibles.minNumber + Math.floor(
                Math.random()
                * (config.collectibles.maxNumber + 1 - config.collectibles.minNumber))
        for (let i = 0; i < this.numberOfCollectibles; i++) {
            // pick a random position within the bounds
            let collectiblePosition = new Vector(
                (Math.random() - 0.5) * config.world.width,
                (Math.random() - 0.5) * config.world.height)
            // place the colllectible
            // TODO pick spell
            this.collectibles.push({
                position: collectiblePosition,
                spell: this.collectiblesSpells[
                    Math.floor(
                        Math.random() * this.collectiblesSpells.length)]
            })
        }
        // generate enemies
        let numberOfEnemies =
            config.enemies.minNumber + Math.floor(
                Math.random()
                * (config.enemies.maxNumber + 1 - config.enemies.minNumber))
        for (let i = 0; i < numberOfEnemies; i++) {
            this.spawnEnemy()
        }
        // set up periodic spawning of enemies
        setInterval(() => {
            this.spawnEnemy()
        }, config.enemies.spawnTimeout * 1000)
    }

    // spawns an enemy
    private spawnEnemy() {
        this.enemies.push({
            position: new Vector(
                (Math.random() - 0.5) * this.config.world.width,
                (Math.random() - 0.5) * this.config.world.height),
            rotation: Math.random() * Math.PI * 2
        })
    }

    // add an action on game over
    onGameOver(cb: () => void) {
        let oldGameOver = this.gameOver
        this.gameOver = () => { oldGameOver(); cb() }
    }

    // add a spell (helper function)
    private addSpell(spell: Spell) {
        // check if there is a spell with the same name
        let indexOfSpellWithTheSameName = -1
        this.spells.forEach((otherSpell, indexOfOtherSpell) => {
            if (spell.name == otherSpell.name) {
                indexOfSpellWithTheSameName = indexOfOtherSpell
            }
        })
        if (indexOfSpellWithTheSameName == -1) {
            // if there isn't one, just add the spell
            this.spells.push(spell)
        } else {
            // if there is one, add this spell's durability to the other spell's
            this.spells[indexOfSpellWithTheSameName].durability += spell.durability
        }
    }

    private collide(body1: Vector, body2: Vector, body1r: number, body2r: number): boolean {
        if (body1.sub(body2).len > body1r / 2 + body2r / 2)
            return true
        return false
    }

    update() {
        // keys that users are allowed to enter
        let allowedKeys = [
            this.config.keybindings.executeSpell,
            "Backspace",
            this.config.keybindings.stopTyping]

        // only include the alphabet, spaces and those keys
        this.spell = this.spell.filter(key =>
            /^[a-zA-Z ]$/.test(key) || allowedKeys.indexOf(key) > -1)
        // iterate through the characters typed this frame (or do nothing)
        this.spell.slice(this.charactersTypedPreviousFrames).forEach(key => {
            if (key == this.config.keybindings.executeSpell) {
                // the user finished the spell(s). apply its effects and reset the spell(s)
                this.spell.pop()
                // only continue if the user typed something
                if (this.spell.length > 0) {
                    // get the list of all spells
                    let enteredSpells = this.spell.join('').split(' ')
                    enteredSpells.forEach(enteredSpell => {
                        // test the spell
                        let spellTester = new RegExp(`.*${enteredSpell.split('').join('.*').toLowerCase()}.*`)
                        let spell = this.spells.filter(spell => spellTester.test(spell.name))[0]
                        // start it
                        if (spell && spell.durability > 0) {
                            spell.durability--
                            this.spellQueue.push({
                                duration: 0,
                                spell: spell
                            })
                        }
                    })
                    // reset
                    this.spell = []
                    this.charactersTypedPreviousFrames = 0
                }
            } else if (key == "Backspace") {
                // erase a letter
                this.spell.pop()
                this.spell.pop()
            } else if (key == this.config.keybindings.stopTyping) {
                // erase the entire spell
                this.spell = []
            }
        })
        // erase repeated spaces in the end
        while ((
            this.spell.length > 1
            && this.spell.slice(this.spell.length - 2, this.spell.length).join('') == '  ')
            || (this.spell.length == 1 && this.spell[0] == ' ')) {
            this.spell.pop()
        }
        // the characters typed so far are now considered to be in the previous frames.
        this.charactersTypedPreviousFrames = this.spell.length
        // clean up spells
        this.spells = this.spells.filter(spell => spell.durability > 0)
        // execute all spells
        this.spellQueue = this.spellQueue.filter(queuedSpell => {
            if (queuedSpell.spell.execute(queuedSpell.duration)) {
                queuedSpell.duration++
                return true
            }
            return false
        })
        // move enemies
        this.enemies.forEach(enemy => {
            enemy.position = enemy.position.add(
                new Vector(
                    Math.sin(enemy.rotation),
                    Math.cos(enemy.rotation))
                    .mul(this.config.enemies.speed))
            enemy.rotation = enemy.rotation + (Math.random() - 0.5) * this.config.enemies.rotationChange
            this.collectibles.forEach(collectible => {
                if (enemy.position.sub(collectible.position).len < this.config.enemies.collectibleActivationRadius) {
                    enemy.rotation =
                        Math.atan2(
                            enemy.position.y - collectible.position.y,
                            enemy.position.x - collectible.position.y)
                }
            })
        })
        // check for collisions with the borders
        this.playerPosition.x =
            Math.min(
                Math.max(
                    this.playerPosition.x,
                    -this.config.world.width / 2),
                this.config.world.width / 2)
        this.playerPosition.y =
            Math.min(
                Math.max(
                    this.playerPosition.y,
                    -this.config.world.height / 2),
                this.config.world.height / 2)
        // for enemies too
        this.enemies.forEach(enemy => {
            enemy.position.x =
                Math.min(
                    Math.max(
                        enemy.position.x,
                        -this.config.world.width / 2),
                    this.config.world.width / 2)
            enemy.position.y =
                Math.min(
                    Math.max(
                        enemy.position.y,
                        -this.config.world.height / 2),
                    this.config.world.height / 2)
            if (Math.abs(enemy.position.x) > this.config.world.width / 2
                || Math.abs(enemy.position.y) > this.config.world.height / 2) {
                enemy.rotation = Math.PI * 2 - enemy.rotation
                enemy.position = enemy.position.add(
                    new Vector(
                        Math.sin(enemy.rotation),
                        Math.cos(enemy.rotation))
                        .mul(this.config.enemies.borderEvasionSpeed))
            }
        })
        // check for collisions with collectibles
        this.collectibles = this.collectibles.filter(collectible => {
            if (this.collide(
                this.playerPosition,
                collectible.position,
                this.config.player.colliderSize,
                this.config.collectibles.colliderSize))
                return true
            this.addSpell(collectible.spell)
        })
        // check for collisions with enemies
        this.enemies = this.enemies.filter(enemy => {
            if (this.collide(
                this.playerPosition,
                enemy.position,
                this.config.player.colliderSize,
                this.config.enemies.colliderSize)
                || this.isPlayerProtected)
                return true
            this.gameOver()
            alert("GAME OVER!")
            return true
        })
        // check if the player won
        if (this.collectibles.length == 0) {
            alert("YOU WON!!!")
            this.gameOver()
        }
        // shift camera 
        let diff = this.playerPosition
            .sub(this.cameraPosition)
        if (diff.len > this.config.camera.moveSpeed) {
            this.cameraPosition =
                this.cameraPosition.add(
                    diff.norm().mul(this.config.camera.moveSpeed))
        }
    }

    render(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        // background
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = "#757a82"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.beginPath()

        // collectibles
        ctx.fillStyle = "#f4c242"
        this.collectibles.forEach(collectible => {
            ctx.arc(
                canvas.width / 2 + collectible.position.x - this.cameraPosition.x,
                canvas.height / 2 + collectible.position.y - this.cameraPosition.y,
                this.config.collectibles.size,
                0,
                Math.PI * 2)
            ctx.fill()
            ctx.beginPath()
        })

        // enemy
        ctx.fillStyle = "#f4c242"
        this.enemies.forEach(enemy => {
            ctx.arc(
                canvas.width / 2 + enemy.position.x - this.cameraPosition.x,
                canvas.height / 2 + enemy.position.y - this.cameraPosition.y,
                this.config.enemies.size,
                0,
                Math.PI * 2
            )
            ctx.fill()
            ctx.beginPath()
        })
        // player
        ctx.drawImage(playerPics.front,
            this.playerPosition.x + canvas.width / 2 - this.cameraPosition.x - this.config.player.size / 2,
            this.playerPosition.y + canvas.height / 2 - this.cameraPosition.y - this.config.player.size / 2,
            this.config.player.size,
            this.config.player.size)
        // spell
        if (this.textSpell != "") {
            // box
            let boxX = canvas.width / 2
                - canvas.width * this.config.spellBox.widthPercent / 100 / 2
            let boxY = canvas.height / 2
                - this.config.spellBox.fontSize
                - this.config.spellBox.verticalOffset / 2 / 100 * canvas.height

            ctx.fillStyle = this.config.spellBox.backgroundColor
            ctx.fillRect(
                boxX - this.config.spellBox.textPadding,
                boxY,
                canvas.width * this.config.spellBox.widthPercent / 100,
                this.config.spellBox.boxSize)
            // text
            ctx.font = `${this.config.spellBox.fontSize}px ${this.config.spellBox.font}`
            ctx.fillStyle = this.config.spellBox.foregroundColor
            ctx.fillText(
                this.textSpell,
                boxX,
                boxY + this.config.spellBox.fontSize)

            // autocompletion
            // the spell currently being typed
            let currentSpells = this.spell.join('').split(' ')
            let currentSpell = currentSpells.pop()
            // find the spell that shares the first letter with the currently typed one
            let bestMatchingIndex = -1
            this.spells.forEach((spell, index) => {
                if (spell.name[0] == currentSpell[0]) {
                    bestMatchingIndex = index
                }
            })
            // make that the first element
            if (bestMatchingIndex != -1) {
                [this.spells[0], this.spells[bestMatchingIndex]]
                    = [this.spells[bestMatchingIndex], this.spells[0]]
            }
            // match for autocompletion
            this.spells.filter(spell =>
                new RegExp(currentSpell.split('').join('.*').toLowerCase()).test(spell.name))
                .forEach(
                    (spell, index) => {
                        let complX = boxX
                        let complY = boxY + (index + 1) * this.config.spellBox.boxSize

                        // box
                        ctx.fillStyle = this.config.spellBox.autocompleteBackgroundColor
                        ctx.fillRect(
                            complX - this.config.spellBox.textPadding,
                            complY,
                            canvas.width * this.config.spellBox.widthPercent / 100,
                            this.config.spellBox.boxSize)

                        // text
                        ctx.fillStyle = this.config.spellBox.autocompleteForegroundColor
                        ctx.fillText(
                            spell.name + (spell.durability == Infinity ? "" : `(${spell.durability})`),
                            complX,
                            complY + this.config.spellBox.fontSize)
                    }
                )
        }
        // HUD score
        ctx.font = `${this.config.hud.fontSize}px ${this.config.hud.font}`
        ctx.fillStyle = this.config.hud.color
        ctx.fillText(
            `${this.numberOfCollectibles - this.collectibles.length}/${this.numberOfCollectibles}`,
            0, this.config.hud.fontSize)
    }

    // gets the text of the spell
    private get textSpell() {
        return this.spell.reduce((currentSpell, spellKey) => currentSpell + spellKey, "")
    }

    // keypress handler
    handleKey(keyCode: KeyboardEvent) {
        // add the character to the current spell
        this.spell.push(keyCode.key)
    }
}

// ugly hack, idk how it works
declare var require: {
    <T>(path: string): T;
    (paths: string[], callback: (...modules: any[]) => void): void;
    ensure: (
        paths: string[],
        callback: (require: <T>(path: string) => T) => void
    ) => void;
};

// get player pictures
let playerPicsGen = ["back", "front", "left", "right"]
let playerPics = {
    right: new Image(), front: new Image(), left: new Image(), back: new Image()
}
playerPicsGen.forEach(picName => {
    playerPics[picName].src = require(`../pics/player/${picName}.png`)
})