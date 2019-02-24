import { config } from './config'
import { Game } from './game'
import start from './engine'

// add interactivity
let minParagraphIndex = 1
let maxParagraphIndex = 5
for (let i = minParagraphIndex; i <= maxParagraphIndex; i++) {
    let elem = document.getElementById(`p${i}`)
    if (i != maxParagraphIndex) {
        let nextElem = document.getElementById(`p${i + 1}`)
        nextElem.style.display = "none"
        let button = document.createElement("button")
        button.innerText = "Next"
        button.onclick = () => {
            nextElem.style.display = "block"
            button.remove()
        }
        elem.appendChild(button)
    }
}

declare function require<T>(path: string): T

// start the game
document.getElementById("death").style.display = "none"
let button = document.getElementById("starter")
button.onclick = () => {
    // play music
    let music: string = require('../sound/track.mp3')
    let audio = document.getElementById("music") as HTMLAudioElement
    audio.src = music
    audio.play()
    let isNotFirstTime = false
    document.getElementById("story").style.display = "none"
    start((cb: (g: Game) => void) => {
        if (isNotFirstTime) {
            // display "you lost message"
            document.getElementById("death").style.display = "block"
            document.getElementById("restart-button").onclick = () => {
                document.getElementById("death").style.display = "none"
                document.getElementById("canvas").style.display = "block"
                isNotFirstTime = true
                cb(new Game(config.game))
            }
        }
        isNotFirstTime = true
        cb(new Game(config.game))
    }, config)
}