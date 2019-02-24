import { Game } from './game'
import { Config } from './config'

export default function start(newGame: (cb: (g: Game) => void) => void, config: Config) {
    // create game
    newGame((game) => {
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
                // hide canvas
                let canvas = document.getElementById("canvas") as HTMLCanvasElement
                canvas.style.display = "none"
                // restart the game
                start(newGame, config)
            }
        })
    })
}