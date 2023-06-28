export default class List {
  constructor() {
    // this is the master that keeps the values themselves
    this._keys = {};
    // this keeps a reference to the key of the value in _keys
    this._values = [];
  }
  
  get length() {
    return this._values.length;
  }
  
  get values() {
    return this._values.map((key) => this._keys[key]);
  }
  
  get keys() {
    return this._values;
  }
  
  get(key, byIndex = false) {
    if (byIndex) {
      return this._keys[this._values[key]];
    }
    
    return this._keys[key];
  }
  
  add(key, value) {
    this._keys[key] = value;
    this._values.push(key); 

    return this;
  }
  
  update(key, newValue, byIndex = false) {
    if (byIndex) {
      this._keys[this._values[key]] = newValue;
    } else {
      this._keys[key] = newValue;
    }
    
    return this;
  }
  
  remove(key, byIndex = false) {
    if (byIndex) {
      delete this._keys[this._values[key]];
      this._values.splice(key, 1);
    } else {
      delete this._keys[key];
      this._values.splice(this._values.findIndex(value => value === key), 1);
    }
    
    return this;
  }
  
  map(callback) {
    return this.values.map((value, index) => {
      return callback(value, this._values[index], index, this);
    });
  }
  
  forEach(callback) {
    this.values.forEach((value, index) => {
      callback(value, this._values[index], index, this);
    });
    return this;
  }
  
  reduce(callback, initialValue) {
    return this.values.reduce((accumulator, value, index) => {
      return callback(accumulator, value, this._values[index], index, this);
    }, initialValue);
  }
}