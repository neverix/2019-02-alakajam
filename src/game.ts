import { GameConfig, config } from './config'
import Spell from './spell'

export class Game {
    // game config
    private config: GameConfig
    // the current spell
    private spell: string[] = []
    // this is the number of characters that were typed in the previous frames.
    // we consider characters after this index to be typed during the current frame.
    private charactersTypedPreviousFrames: number = 0
    // list of all spells
    private spells: Spell[] = [{
        name: "alakajam",
        execute: () => alert('ALAKAJAM!!!')
    },
    {
        name: "alakaboom",
        execute: () => alert("ALAKABOOM!!!")
    }]

    constructor(config: GameConfig) {
        this.spells = this.spells.map(spell => {
            return {
                name: spell.name.toLowerCase(),
                execute: spell.execute
            }
        })
        this.config = config
    }

    update(dt: number) {
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
                    if (spell) {
                        spell.execute()
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
        while (
            this.spell.length > 1
            && this.spell.slice(this.spell.length - 2, this.spell.length).join('') == '  ') {
            this.spell.pop()
        }
        // the characters typed so far are now considered to be in the previous frames.
        this.charactersTypedPreviousFrames = this.spell.length
    }

    render(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        // background
        ctx.fillStyle = "#757a82"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
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