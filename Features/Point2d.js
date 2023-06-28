export default class Point2d {
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
    
    set(x, y) {
        this._x = x;
        this._y = y;
    }
    
    // calculatenthe distance between this and another point
    distance(point) {
        const dx = Math.abs(this._x - point.x);
        const dy = Math.abs(this._y - point.y);
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // calculate line between this and another point
    lineTo(point) {
        const dx = Math.abs(this._x - point.x);
        const dy = Math.abs(this._y - point.y);
        const a = dy / dx;
        const b = this._y - this._x * a;
        const angle = Math.atan(a);
        
        return {
            a: a,
            b: b,
            angle: angle,
            interpolate: (function(a, b, x) {
                return a * x + b;
            }).bind(null, a, b)
        };
    }
    
    angle(point) {
        const dx = point.x - this._x;
        const dy = point.y - this._y;
        
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
        return `Point - x: ${this._x}, y: ${this._y}`;
    }
}