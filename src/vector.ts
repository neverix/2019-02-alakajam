export default class Vector {
    x: number
    y: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    add(other: Vector) {
        return new Vector(this.x + other.x, this.y + other.y)
    }

    sub(other: Vector) {
        return new Vector(this.x - other.x, this.y - other.y)
    }

    mul(other: number) {
        return new Vector(this.x * other, this.y * other)
    }


    div(other: number) {
        return new Vector(this.x / other, this.y / other)
    }

    len() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))
    }

    norm() {
        return this.div(this.len())
    }
}