import Point2d from './Point2d.js';

export default class TouchPoint2d extends Point2d {
  constructor(id, time, x, y) {
      super(x, y);
      
      this.id = id;
      this.time = time;
  }
  
  copy() {
    return new TouchPoint2d(
      this.id,
      (new Date()).getTime(),
      this.x,
      this.y,
    );
  }
}