export default interface Spell {
    // the name of the spell
    name: string
    // receives the current frame of the spell
    // returns whether this spell can continue executing
    execute(n: number): boolean
}