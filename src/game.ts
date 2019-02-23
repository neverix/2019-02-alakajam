import { GameConfig } from './config'
import Vector from './vector'

export class Game {
    private config: GameConfig

    constructor(config: GameConfig) {
        this.config = config
    }

    update(dt: number) {

    }

    render(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = "#757a82";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}