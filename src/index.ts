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
// start the game
let button = document.getElementById("starter")
button.onclick = () => {
    document.getElementById("story").style.display = "none"
    start(() => {
        return new Game(config.game)
    }, config)
}