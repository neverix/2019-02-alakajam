import { config } from './config'
import { Game } from './game'

let canvas = document.createElement('canvas');
canvas.width = config.canvas.width;
canvas.height = config.canvas.height;
canvas.style.position = "absolute";
document.body.appendChild(canvas);

let ctx = canvas.getContext("2d");

function timestamp() {
    return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
}

let game = new Game(config.game)
let now, dt, last = timestamp();

requestAnimationFrame(function frame() {
    now = timestamp();
    dt = Math.min(1, (now - last) / 1000);
    game.update(dt);
    game.render(canvas, ctx);
    last = now;
    requestAnimationFrame(frame);
});