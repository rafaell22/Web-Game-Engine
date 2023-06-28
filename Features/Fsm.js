/**
 * EXAMPLE
 * transitions: [
       { name: 'initialize', from: 'initial', to:'final' },
       { name: 'restart', from: '*', to:'initial' }
    ],
 * actions:
 *    {
 *      onBeforeInitialize
 *      onLeaveInitial
 *      onInitialize: function() {},
 *      onEnterFinal
 *      onAfterInitialize
 *    ],
 * 'initial'
 * @type {[type]}
 */
function Fsm(states, transitions, actions, initialState) {
    this.state = null;
    this.transitions = transitions;
    this.actions = actions;
    this.transictionsByState = {};
    this.states = states;

    if (initialState) {
      this.state = initialState;
    }

    let fromStates;
    const wildCardTransitions = [];
    let currentTransition;
    for(let transitionIndex = (this.transitions.length - 1); transitionIndex > -1; transitionIndex--) {
      currentTransition = this.transitions[transitionIndex];
      this[currentTransition.name] = (async function(to, transition) {
        if (this.cannot(transition)) {
          console.log(`State ${this.state} cannot ${transition}!`);
          return;
        }
        console.log(`Transitioning from ${this.state} to ${to}`);
        if (this.actions['onBefore' + transition[0].toUpperCase() + transition.slice(1)]) {
          await this.actions['onBefore' + transition[0].toUpperCase() + transition.slice(1)].call(this);
        }

        if (
          this.state
          && this.actions['onLeave' + this.state[0].toUpperCase() + this.state.slice(1)]
        ) {
          await this.actions['onLeave' + this.state[0].toUpperCase() + this.state.slice(1)].call(this);
        }

        if (this.actions['on' + transition[0].toUpperCase() + transition.slice(1)]) {
          await this.actions['on' + transition[0].toUpperCase() + transition.slice(1)].call(this);
        }
        this.state = to;

        if (this.actions['onEnter' + to[0].toUpperCase() + to.slice(1)]) {
          await this.actions['onEnter' + to[0].toUpperCase() + to.slice(1)].call(this);
        }

        if (this.actions['onAfter' + transition[0].toUpperCase() + transition.slice(1)]) {
          await this.actions['onAfter' + transition[0].toUpperCase() + transition.slice(1)].call(this);
        }
      }).bind(this, currentTransition.to, currentTransition.name);

      if (currentTransition.from === '*') {
        wildCardTransitions.push(currentTransition);
      } else {
        fromStates = currentTransition.from;
        if (typeof fromStates === 'string') {
          fromStates = [fromStates];
        }

        for(let fromStateIndex = (fromStates.length - 1); fromStateIndex > -1; fromStateIndex--) {
          if (!this.transictionsByState[fromStates[fromStateIndex]]) {
            this.transictionsByState[fromStates[fromStateIndex]] = {};
          }
          this.transictionsByState[fromStates[fromStateIndex]][currentTransition.name] = currentTransition.to;

          if (!this.states.includes(fromStates[fromStateIndex])) {
            this.states.push(fromStates[fromStateIndex]);
          }
        }
      }

      if (!this.states.includes(currentTransition.to)) {
        this.states.push(currentTransition.to);
      }
    }

    let currentState;
    for(let wildCardIndex = (wildCardTransitions.length - 1); wildCardIndex > -1; wildCardIndex--) {
      currentTransition = wildCardTransitions[wildCardIndex];

      if (!this.states.includes(currentTransition.to)) {
        this.states.push(currentTransition.to);
      }
      for(let stateIndex = (this.states.length - 1); stateIndex > -1; stateIndex--) {
        currentState = this.states[stateIndex];
        if (currentTransition.to !== currentState) {
          if (!this.transictionsByState[currentState]) {
            this.transictionsByState[currentState] = {};
            this.transictionsByState[currentState][currentTransition.name] = currentTransition.to;
          }
          this.transictionsByState[currentState][currentTransition.name] = currentTransition.to;
        }
      }
    }
}
Fsm.prototype.can = function(transition, from) {
    const fromState = from ? from : this.state;
    if (
      !fromState
      || (
        this.transictionsByState[fromState]
        && this.transictionsByState[fromState][transition]
      )
    ) {
      return true;
    }
    return false;
}
Fsm.prototype.cannot = function(transition, from) {
    return !this.can(transition, from);
}
Fsm.prototype.is = function(state) {
    return this.state === state;
}
Fsm.prototype.allowed = function(from) {
    const fromState = from ? from : this.state;
    const allowedTransitions = [];
    if (fromState) {
      for(const transition in this.transictionsByState[fromState]) {
        allowedTransitions.push(transition);
      }
    } else {
      for(let transitionIndex = (this.transitions.length - 1); transitionIndex > -1; transitionIndex--) {
        allowedTransitions.push(this.transitions[transitionIndex].name);
      }
    }

    return allowedTransitions;
}

Fsm.prototype.addAction = function(action, callback) {
    this.actions[action] = callback;
}

export default Fsm;