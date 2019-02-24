import Vector from "./vector";
import Spell from "./spell";

export default interface Collectible {
    // position
    position: Vector
    // associated spell
    spell: Spell
}