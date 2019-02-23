export default interface Spell {
    name: string
    execute(n: number): boolean
}