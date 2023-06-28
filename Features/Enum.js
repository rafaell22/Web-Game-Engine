function Enum(values) {
    const enumValues = {};
    for(const value of values) {
        enumValues[value]  = value;
        Object.defineProperty(this, value, {
            enumerable: true,
            get() { return enumValues[value] },
            set() { console.log(`Can't set property of Enum.`); },
        });
    }
}

export default Enum;