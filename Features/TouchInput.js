import Fsm from './Fsm.js';
import Enum from './Enum.js';
import PubSub from './PubSub.js';
import TouchPoint2d from './TouchPoint2d.js';
import Point2d from './Point2d.js';
import VirtualTouchStick from './VirtualTouchStick.js';

function copyTouch({ identifier, pageX, pageY }) {
  return new TouchPoint2d( 
    identifier, 
    (new Date()).getTime(),
    pageX, 
    pageY,
  );
}

function ongoingTouchIndexById(ongoingTouch, touches) {
  for (let i = 0; i < touches.length; i++) {
    let id = touches[i].identifier;

    if (id == ongoingTouch.id) {
      return i;
    }
  }
  return -1;    // not found
}

class TouchInput {
    constructor(touchSurface) {
        this.touchSurface = touchSurface;
        this.prevTouch = null;
        this.currentTouch = null;
        this.startTouch = null;
        this.touches = [];
        
        this.hasTapped = false;
        this.tapThreshold = 300; // in ms
        this.moveThreshold = 5; // in pixels
        this.swipeThreshold = 1500; // in pixels/s
        
        this.eventListeners = new PubSub();
        this.events = new Enum('TAP', 'DOUBLE_TAP', 'DRAG');
        
        this.virtualJoystick = new VirtualTouchStick();
        this.addChild(this.virtualJoystick);
        
        Fsm.call(
            this,
            [
                'idling',
                'tapped',
                'dragging',
                'swipped'
            ],
            [
                {
                    name: 'tap', 
                    from: 'idling', 
                    to: 'tapped',
                },
                {
                    name: 'drag', 
                    from: [ 'idling', 'swipped' ],
                    to: 'dragging',
                },
                {
                    name: 'swipe', 
                    from: [ 'idling', 'dragging' ], 
                    to: 'swipped',
                },
                {
                    name: 'idle', 
                    from: '*', 
                    to: 'idling',
                },
            ],
            {
                onTap: function() {
                    this.hasTapped = true;
                }
            }, // actions
            'idling', // initial state
        );
    }
    
    attach(element) {
        this.eventListeners.touchstart = this.onTouchStart.bind(this);
        this.eventListeners.touchmove = this.onTouchMove.bind(this);
        this.eventListeners.touchend = this.onTouchEnd.bind(this);
        this.eventListeners.touchcancel = this.onTouchCancel.bind(this);
        
        element.addEventListener('touchstart', this.eventListeners.touchstart);
        element.addEventListener('touchmove', this.eventListeners.touchmove);
        element.addEventListener('touchend', this.eventListeners.touchend);
        element.addEventListener('touchcancel', this.eventListeners.touchcancel);
    }
    
    remove() {
        element.removeEventListener('touchstart', this.eventListeners.touchstart);
        element.removeEventListener('touchmove', this.eventListeners.touchmove);
        element.removeEventListener('touchend', this.eventListeners.touchend);
        element.removeEventListener('touchcancel', this.eventListeners.touchcancel);
    }
    
    onTouchStart(event) {
        event.preventDefault();
        const touches = event.changedTouches;
        this.prevTouch = this.currentTouch;
        this.currentTouch = new TouchPoint2d(
          touches[0].identifier,
          (new Date()).getTime(),
          touches[0].pageX,
          touches[0].pageY,
        );
        // if(!this.startTouch) {
            this.startTouch = this.currentTouch.copy();
        // }
        this.touchStickContainer.x = this.currentTouch.x;
        this.touchStickContainer.y = this.currentTouch.y;
        this.touchStick.visible = true;
    };
        
    onTouchMove(event) {
      event.preventDefault();
      const touches = event.changedTouches;

      const idx = ongoingTouchIndexById(this.currentTouch, touches);

      if (idx >= 0) {
            this.prevTouch = this.currentTouch;
            this.currentTouch = new TouchPoint2d(
              idx, 
              (new Date()).getTime(),
              touches[idx].pageX,
              touches[idx].pageY,
            );
        // const dx = this.prevTouch.pageX - touches[idx].pageX;
        // const dy = this.prevTouch.pageY - touches[idx].pageY;
        
        // calculate dx and dy against start touch to calculate drag/swupe direction        
        const distance = this.currentTouch.distance(this.startTouch);
        console.log('distance:', distance);
        // calculate speed against previous to separate if it is a drag or a swipe
        const speed = this.currentTouch.distance(this.prevTouch) / (this.currentTouch.time - this.prevTouch.time) * 1000;
        console.log('speed: ', speed);
        
        this.touchStick.x = this.currentTouch.x - this.startTouch.x
        this.touchStick.y = this.currentTouch.y - this.startTouch.y;
        if(distance > this.moveThreshold) {
            if(speed > this.swipeThreshold) {
                if(this.state !== 'swipped') {
                    this.swipe();
                }
            } else {
                if(this.state !== 'dragging') {
                  this.drag();   
                }
            }
        } else {
            this.idle();
        }
      } else {
        console.log("can't figure out which touch to continue");
      }
    }
    
    onTouchEnd(event) {
      event.preventDefault();
      
      if((new Date()).getTime() - this.startTouch.time <= this.tapThreshold) {
            this.tap();
        } else {
            this.idle();
        }
      
      const touches = event.changedTouches;
      const idx = ongoingTouchIndexById(this.currentTouch, touches);
      if (idx >= 0) {
          if(touches[idx] === this.startTouch.id) {
              this.startTouch = null;
          }
        this.prevTouch = this.currentTouch;
        this.currentTouch = null;
      } else {
        console.log("can't figure out which touch to continue");
      }
    }
    
    onTouchCancel(event) {
      event.preventDefault();
      const touches = event.changedTouches;
      const idx = ongoingTouchIndexById(this.prevTouch, touches);
      if (idx >= 0) {
        this.prevTouch = {};
      } else {
        console.log("can't figure out which touch to continue");
      }
    }
    
    get dragDirection() {
      if( 
        !this.currentTouch ||
        !this.startTouch
      ) {
        return null;
      }
      return new Vector2d(
        this.currentTouch.x - this.startTouch.x,
        this.currentTouch.y - this.startTouch.y,
      );
    }
    
    update(dt) {
        switch(this.state) {
          case('tapped'):
            if(!this.hasTapped) {
              this.idle();
            }
            break;
          case('drag'):
            
            break;
          default:
        }
        if(this.hasTapped) {
          this.hasTapped = false;
        }
    }
}

TouchInput.augment(Fsm);

export default TouchInput;