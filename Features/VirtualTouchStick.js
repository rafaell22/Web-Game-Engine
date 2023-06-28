import Vector2d from './Vector2d.js';

export default class TouchInput extends PIXI.Container {
    constructor() {
        this.touchStickContainer = new PIXI.Container();
        this.touchStickContainer.x = window.innerWidth/2;
        this.touchStickContainer.y = window.innerHeight/2;
        this.touchStickBase = new PIXI.Graphics();
        this.touchStickBase
              .lineStyle(
                2,
                0xE0E0E0, 
                1, 
                1,
              )
              .beginFill(
                0xE00040,
                0.5,
              )
              .drawCircle(
                0,
                0,
                // this.currentTouch.x, 
                // this.currentTouch.y, 
                50,
              )
              .endFill();
        this.touchStick = new PIXI.Graphics();
        this.touchStick
              .lineStyle(
                2,
                0xE0E0E0, 
                1, 
                1,
              )
              .beginFill(
                0xE00040,
                1,
              )
              .drawCircle(
                0,
                0,
                // this.currentTouch.x, 
                // this.currentTouch.y, 
                20,
              )
              .endFill();
        this.touchStickContainer.addChild(this.touchStickBase);
        this.touchStickContainer.addChild(this.touchStick);
        this.addChild(this.touchStickContainer);
        
        this.visible = false;
    }
    
    setPosition(x, y) {
      this.x = x;
      this.y = y;
    }
    
    setStickPosition(x, y) {
    }
    
    show() {
      this.visible = true;
    }
    
    hide() {
      this.visible = false;
    }
}