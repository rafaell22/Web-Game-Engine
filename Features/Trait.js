const positionable = Trait({x:0,y:0});
const move = Behaviour({move:NOOP}, [x, y]);
// Extend an existing object with a method from another

// Useful when an object must inherit from multiple objects (mixin pattern)

Object.defineProperty(Object.prototype, 'addTrait', {
  enumerable: false,
  value: function( trait ) {
          for ( const atribute in trait) {
              if ( !this.hasOwnProperty(methodName) ) {
                  this.prototype[methodName] = givingClass.prototype[methodName];
              }
          }
  }
});