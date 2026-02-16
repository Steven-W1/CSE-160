/**
 * Vector class for basic vector mathematics
 * Supports operations on n-dimensional vectors
 */
class Vector {
    /**
     * Create a vector
     * @param {...number|Array} components - Vector components as individual args or array
     */
    constructor(...components) {
        // Handle both Vector(1,2,3) and Vector([1,2,3])
        if (components.length === 1 && Array.isArray(components[0])) {
            this.components = [...components[0]];
        } else {
            this.components = [...components];
        }
    }

    /**
     * Get the dimension of the vector
     */
    get dimension() {
        return this.components.length;
    }



    /**
     * Get component at index
     */
    get(index) {
        return this.components[index];
    }

    /**
     * Set component at index
     */
    set(index, value) {
        this.components[index] = value;
    }

    /**
     * Add another vector to this vector
     * @param {Vector} other - Vector to add
     * @returns {Vector} New vector (this + other)
     */
    add(other) {
        if (this.dimension !== other.dimension) {
            throw new Error('Vectors must have the same dimension');
        }
        const result = this.components.map((val, i) => val + other.components[i]);
        return new Vector(result);
    }

    /**
     * Subtract another vector from this vector
     * @param {Vector} other - Vector to subtract
     * @returns {Vector} New vector (this - other)
     */
    subtract(other) {
        if (this.dimension !== other.dimension) {
            throw new Error('Vectors must have the same dimension');
        }
        const result = this.components.map((val, i) => val - other.components[i]);
        return new Vector(result);
    }

    /**
     * Multiply vector by a scalar
     * @param {number} scalar - Scalar to multiply by
     * @returns {Vector} New scaled vector
     */
    scale(scalar) {
        const result = this.components.map(val => val * scalar);
        return new Vector(result);
    }

    /**
     * Dot product with another vector
     * @param {Vector} other - Vector to dot with
     * @returns {number} Dot product
     */
    dot(other) {
        if (this.dimension !== other.dimension) {
            throw new Error('Vectors must have the same dimension');
        }
        return this.components.reduce((sum, val, i) => sum + val * other.components[i], 0);
    }

    /**
     * Cross product (only for 3D vectors)
     * @param {Vector} other - Vector to cross with
     * @returns {Vector} Cross product vector
     */
    cross(other) {
        if (this.dimension !== 3 || other.dimension !== 3) {
            throw new Error('Cross product only defined for 3D vectors');
        }
        const [a1, a2, a3] = this.components;
        const [b1, b2, b3] = other.components;
        return new Vector(
            a2 * b3 - a3 * b2,
            a3 * b1 - a1 * b3,
            a1 * b2 - a2 * b1
        );
    }

    /**
     * Calculate the magnitude (length) of the vector
     * @returns {number} Vector magnitude
     */
    magnitude() {
        return Math.sqrt(this.components.reduce((sum, val) => sum + val * val, 0));
    }

    /**
     * Get the unit vector (normalized)
     * @returns {Vector} Normalized vector
     */
    normalize() {
        const mag = this.magnitude();
        if (mag === 0) {
            throw new Error('Cannot normalize zero vector');
        }
        return this.scale(1 / mag);
    }

    /**
     * Calculate distance to another vector
     * @param {Vector} other - Other vector
     * @returns {number} Distance
     */
    distanceTo(other) {
        return this.subtract(other).magnitude();
    }

    /**
     * Check if this vector equals another vector
     * @param {Vector} other - Vector to compare
     * @param {number} epsilon - Tolerance for floating point comparison
     * @returns {boolean} True if vectors are equal
     */
    equals(other, epsilon = 1e-10) {
        if (this.dimension !== other.dimension) {
            return false;
        }
        return this.components.every((val, i) => 
            Math.abs(val - other.components[i]) < epsilon
        );
    }

    /**
     * Create a copy of this vector
     * @returns {Vector} New vector with same components
     */
    clone() {
        return new Vector(this.components);
    }

    /**
     * Convert vector to array
     * @returns {Array} Array of components
     */
    toArray() {
        return [...this.components];
    }

    /**
     * String representation
     * @returns {string} String representation
     */
    toString() {
        return `Vector(${this.components.join(', ')})`;
    }

    /**
     * Static method: Create zero vector of given dimension
     * @param {number} dimension - Dimension of zero vector
     * @returns {Vector} Zero vector
     */
    static zero(dimension) {
        return new Vector(Array(dimension).fill(0));
    }

    /**
     * Static method: Create a vector from two points
     * @param {Vector} from - Starting point
     * @param {Vector} to - Ending point
     * @returns {Vector} Vector from 'from' to 'to'
     */
    static fromPoints(from, to) {
        return to.subtract(from);
    }


    divide(scalar) {
    if (scalar === 0) {
        throw new Error('Cannot divide vector by zero');
    }
    const result = this.components.map(val => val / scalar);
    return new Vector(result);
    }
}