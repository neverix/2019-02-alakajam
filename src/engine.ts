import { Game } from './game'
import { Config } from './config'

export default function start(newGame: () => Game, config: Config) {
    // create a game
    let game = newGame()
    // create canvas
    let canvas = document.createElement('canvas')
    canvas.width = config.canvas.width
    canvas.height = config.canvas.height
    canvas.style.position = "absolute"
    document.body.appendChild(canvas)
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
            // restart the game
            start(newGame, config)
        }
    })
}