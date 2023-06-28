class Tween {
    constructor(
        initialValue,
        finalValue,
        duration,
        easing
    ) {
        this.initialValue = initialValue;
        this.finalValue = finalValue;
        this.dy = (this.finalValue - this.initialValue);
        this.duration = duration;
        
        if(!this[easing]) {
            throw new Error(`Easing ${easing} not found!`);
        }
        this.easing = this[easing];
        
        this.x = 0;
    }
    
    next(dt) {
        this.x += dt;
        if(this.x >= this.duration) {
            this.x = this.duration;
            return this.finalValue;
        }
        return this.easing(this.x);
    }
    
    linear(x) {
        return (this.initialValue * (this.duration - x) + this.finalValue * x) / this.duration;
    }
    
    easeInSine(x) {
        return (1 - Math.cos(( x / this.duration * Math.PI) / 2)) * this.dy + this.initialValue;
    }
    
    easeOutSine(x) {
        return Math.sin((x / this.duration * Math.PI) / 2) * this.dy + this.initialValue;
    }
    
    easeInOutSine(x) {
        return (-(Math.cos(Math.PI * x / this.duration) - 1) / 2) * this.dy + this.initialValue;
    }
    
    easeInExpo(x) {
        return (x / this.duration) === 0 ? 0 : (Math.pow(2, 10 * x / this.duration - 10)) * this.dy + this.initialValue;
    }
    
    easeOutExpo(x) {
        return (x / this.duration) === 1 ? 1 : (1 - Math.pow(2, -10 * x / this.duration)) * this.dy + this.initialValue;
    }
    
    easeInOutExpo(x) {
        return x / this.duration === 0
            ? 0
            : x / this.duration === 1
            ? 1
            : x / this.duration < 0.5 ? Math.pow(2, 20 * x / this.duration - 10) / 2 * this.dy + this.initialValue
            : (2 - Math.pow(2, -20 * x / this.duration + 10)) / 2 * this.dy + this.initialValue;
    }
    
    easeInBack(x) {
        const c1 = 1.70158;
        const c3 = c1 + 1;

        return (c3 * x * x * x / ( this.duration * this.duration *this.duration ) - c1 * x * x / (this.duration * this.duration)) * this.dy + this.initialValue;
    }
    
    easeOutBack(x) {
        const c1 = 1.70158;
        const c3 = c1 + 1;

        return (1 + c3 * Math.pow(x / this.duration - 1, 3) + c1 * Math.pow(x / this.duration - 1, 2)) * this.dy + this.initialValue;
    }
    
    easeInOutBack(x) {
        const c1 = 1.70158;
        const c2 = c1 * 1.525;

        return x / this.duration < 0.5
            ? (Math.pow(2 * x / this.duration, 2) * ((c2 + 1) * 2 * x / this.duration - c2)) / 2 * this.dy + this.initialValue
            : (Math.pow(2 * x / this.duration - 2, 2) * ((c2 + 1) * (x / this.duration * 2 - 2) + c2) + 2) / 2 * this.dy + this.initialValue;
    }
}