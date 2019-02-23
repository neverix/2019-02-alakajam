import { config } from './config'
import { Game } from './game'
import start from './engine'

// start the game
let game = new Game(config.game)
start(game, config)