import Vector from "./vector";
import Spell from "./spell";

export default class Collectible {
    // position
    position: Vector
    // associated spell
    spell: Spell

    constructor(position: Vector, spell: Spell) {
        this.position = position
        this.spell = spell
    }
}