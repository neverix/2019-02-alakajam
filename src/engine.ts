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
    let now, dt, last = timestamp()
    requestAnimationFrame(function frame() {
        now = timestamp()
        dt = Math.min(1, (now - last) / 1000)
        try {
            game.update(dt)
            game.render(canvas, ctx)
        } catch (e) {
            alert(e.stack)
        }
        last = now
        requestAnimationFrame(frame)
    })
}

// browser independent timestamp function used to get the delta time in the game loop
function timestamp() {
    return window.performance && window.performance.now ? window.performance.now() : new Date().getTime()
}