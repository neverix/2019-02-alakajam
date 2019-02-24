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

    constructor(config: GameConfig) {
        this.config = config
        // spells for moving
        let directions: { [dir: string]: [number, number] } = {
            up: [0, -1],
            down: [0, 1],
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
                        } else {
                            return false
                        }
                        return true
                    },
                    durability: Infinity
                })
        }

        // lowercase the spell names
        this.spells.forEach(spell => {
            spell.name = spell.name.toLowerCase()
        })

        // generate collectibles
        // pick a random number of collectibles
        this.numberOfCollectibles =
            this.config.collectibles.minNumber + Math.floor(
                Math.random()
                * (this.config.collectibles.maxNumber + 1 - this.config.collectibles.minNumber))
        for (let i = 0; i < this.numberOfCollectibles; i++) {
            // pick a random position within the bounds
            let collectiblePosition = new Vector(
                (Math.random() - 0.5) * this.config.world.width,
                (Math.random() - 0.5) * this.config.world.height)
            // place the colllectible
            // TODO pick spell
            this.collectibles.push({
                position: collectiblePosition,
                spell: {
                    name: "kool spell",
                    execute: _n => { alert("Spell used"); return false },
                    durability: 1
                }
            })
        }
        // generate enemies
        // TODO
        this.enemies.push({
            position: new Vector(100, 0)
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

    update() {
        // keys that users are allowed to enter
        let allowedKeys = ["Enter", "Backspace", "Escape"]

        // only include the alphabet, spaces and those keys
        this.spell = this.spell.filter(key =>
            /^[a-zA-Z ]$/.test(key) || allowedKeys.indexOf(key) > -1)
        // iterate through the characters typed this frame (or do nothing)
        this.spell.slice(this.charactersTypedPreviousFrames).forEach(key => {
            if (key == "Enter") {
                // the user finished the spell. apply its effects and reset the spell
                this.spell.pop()
                // only continue if the user typed something
                if (this.spell.length > 0) {
                    // test the spell
                    let spellTester = new RegExp(`.*${this.spell.join('.*').toLowerCase()}.*`)
                    let spell = this.spells.filter(spell => spellTester.test(spell.name))[0]
                    // start it
                    if (spell && spell.durability > 0) {
                        spell.durability--
                        this.spellQueue.push({
                            duration: 0,
                            spell: spell
                        })
                    }
                    // reset
                    this.spell = []
                    this.charactersTypedPreviousFrames = 0
                }
            } else if (key == "Backspace") {
                // erase a letter
                this.spell.pop()
                this.spell.pop()
            } else if (key == "Escape") {
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
        // check for collisions with collectibles
        this.collectibles = this.collectibles.filter(collectible => {
            if (this.playerPosition.sub(collectible.position).len
                > this.config.player.picSize * this.config.player.size
                + this.config.collectibles.picSize * this.config.collectibles.size)
                return true
            this.addSpell(collectible.spell)
        })
        // check for collisions with enemies
        this.enemies = this.enemies.filter(enemy => {
            if (this.playerPosition.sub(enemy.position).len
                > this.config.player.picSize * this.config.player.size
                + this.config.collectibles.picSize * this.config.collectibles.size)
                return true
            this.gameOver()
            alert("GAME OVER!")
            return true
        })
        // shift camera 
        this.cameraPosition =
            this.cameraPosition.add(
                this.playerPosition
                    .sub(this.cameraPosition)
                    .norm()
                    .mul(this.config.camera.moveSpeed))
        // check if the player won
        if (this.collectibles.length == 0) {
            alert("YOU WON!!!")
            this.gameOver()
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
        ctx.fillStyle = "#9a5bff"
        ctx.arc(
            canvas.width / 2 + this.playerPosition.x - this.cameraPosition.x,
            canvas.height / 2 + this.playerPosition.y - this.cameraPosition.y,
            this.config.player.size,
            0,
            Math.PI * 2)
        ctx.fill()
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
            this.spells.filter(spell =>
                new RegExp(this.spell.join('.*').toLowerCase()).test(spell.name)).forEach(
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