import { config } from './config'
import { Game } from './game'
import start from './engine'

// start the game
start(() => new Game(config.game), config)