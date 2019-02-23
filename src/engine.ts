import { Game } from './game'
import { Config } from './config'

export default function start(game: Game, config: Config) {
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

    // start the game loop
    requestAnimationFrame(function frame() {
        try {
            game.update()
            game.render(canvas, ctx)
        } catch (e) {
            alert(e.stack)
        }
        requestAnimationFrame(frame)
    })
}