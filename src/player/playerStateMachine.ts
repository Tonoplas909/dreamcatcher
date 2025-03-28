type StateHandler = {
    onEnter?: () => void;
    onExit?: () => void;
};

class PlayerStateMachine<TState extends string> {
    private currentState: TState | null = null;
    private states: Record<TState, StateHandler>;

    constructor(states: Record<TState, StateHandler>) {
        this.states = states;
    }

    public changeState(newState: TState): void {
        if (this.currentState !== newState) {
            if (this.currentState && this.states[this.currentState]?.onExit) {
                this.states[this.currentState].onExit!();
            }

            console.log(`Transitioning from ${this.currentState} to ${newState}`);
            this.currentState = newState;

            if (this.states[newState]?.onEnter) {
                this.states[newState].onEnter!();
            }
        }
    }
}

export default PlayerStateMachine;
