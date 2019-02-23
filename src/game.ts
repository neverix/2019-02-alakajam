import { GameConfig, config } from './config'
import Spell from './spell'
import Vector from './vector';

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
    // currently executing spells
    private spellQueue: { duration: number, spell: Spell }[] = []
    // list of all spells
    private spells: Spell[] = []


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
            this.spells.push(
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
                    }
                })
        }

        // lowercase the spell names
        this.spells = this.spells.map(spell => {
            return {
                name: spell.name.toLowerCase(),
                execute: spell.execute
            }
        })
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
                    if (spell) {
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
        // execute all spells
        let queuedSpellsQueuedForDeletion: number[] = []
        this.spellQueue.filter((queuedSpell, index) => {
            if (queuedSpell.spell.execute(queuedSpell.duration)) {
                queuedSpell.duration++
                return true
            } else {
                queuedSpellsQueuedForDeletion.push(index)
                return false
            }
        })
    }

    render(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {

        // background
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = "#757a82"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.beginPath()
        // player
        ctx.fillStyle = "#9a5bff"
        ctx.arc(
            canvas.width / 2 + this.playerPosition.x,
            canvas.height / 2 + this.playerPosition.y,
            this.config.player.size,
            0,
            Math.PI * 2)
        ctx.fill()
        // spell
        if (this.textSpell != "") {
            // spell
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
                new RegExp(`.*${this.spell.join('.*').toLowerCase()}.*`).test(spell.name)).forEach(
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
                        ctx.font = `${this.config.spellBox.fontSize}px ${this.config.spellBox.font}`
                        ctx.fillStyle = this.config.spellBox.autocompleteForegroundColor
                        ctx.fillText(
                            spell.name,
                            complX,
                            complY + this.config.spellBox.fontSize)
                    }
                )
        }
    }

    // gets the text of the spell
    private get textSpell() {
        return this.spell.reduce((currentSpell, spellKey) => currentSpell + spellKey, "")
    }

    handleKey(keyCode: KeyboardEvent) {
        // add the character to the current spell
        this.spell.push(keyCode.key)
    }
}