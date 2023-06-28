export default class Vector2d {
    constructor(x, y) {
        this._x = x;
        this._y = y;
    }
    
    get x() {
        return this._x;
    }
    
    get y() {
        return this._y;
    }
    
    set x(x) {
        this._x = x;
    }
    
    set y(y) {
        this._y = y;
    }
    
    normalize() {
      console.log('magnitude: ', this.magnitude);
      this.x = this.x / this.magnitude;
      this.y = this.y / this.magnitude;
	}
    
    // calculate the magnitude of the vector
    get magnitude() {
        const dx = Math.abs(this.x);
        const dy = Math.abs(this.y);
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    angle() {
        const dx = this._x;
        const dy = this._y;
        
        if(dx === 0) {
            if(dy === 0) {
                return 0;
            } else if(
                dy > 0
            ) {
                return Math.PI / 2;
            } else {
                return 3 * Math.PI / 2;
            }
        }
        
        const angle = Math.atan(dy / dx);

        if(
            (dy < 0 && dx < 0) ||
            (dy > 0 && dx < 0) ||
            (dy === 0 && dx < 0)
        ) {
            return angle + Math.PI;
        } 
        
        if(angle < 0) {
            return angle + 2 * Math.PI;
        }
        
        return angle;
    }
    
    toString() {
        return `Vector2d - x: ${this._x}, y: ${this._y}`;
    }
}