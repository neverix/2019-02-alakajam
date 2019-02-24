import { Game } from './game'
import { Config } from './config'

export default function start(newGame: () => Game, config: Config) {
    // create a game
    let game = newGame()
    // create canvas
    let canvas = document.getElementById("canvas") as HTMLCanvasElement
    canvas.width = config.canvas.width
    canvas.height = config.canvas.height
    canvas.style.position = "absolute"
    let ctx = canvas.getContext("2d")

    // handle key presses
    window.addEventListener('keydown', key => {
        game.handleKey(key)
    }, false)

    // set up game over handling
    let isGameOver = false
    game.onGameOver(() => {
        isGameOver = true
    })

    // play music
    let music: string = require('../sound/track.mp3')
    let audio = document.getElementById("music") as HTMLAudioElement
    audio.src = music
    audio.play()

    // start the game loop
    requestAnimationFrame(function frame() {
        // check if game called gameOver()
        if (!isGameOver) {
            // error handlig
            try {
                // update game state
                game.update()
                // render game state
                game.render(canvas, ctx)
            } catch (e) {
                // "error handling"
                alert(e.stack)
            }
            // continue animation
            requestAnimationFrame(frame)
        } else {
            // reset game over
            isGameOver = false
            // restart the game
            start(newGame, config)
        }
    })
}

declare function require<T>(path: string): T