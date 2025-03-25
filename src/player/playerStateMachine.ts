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

// Example usage:
const playerStates = {
    idle: {
        onEnter: () => console.log('Entering idle state'),
        onExit: () => console.log('Exiting idle state'),
    },
    running: {
        onEnter: () => console.log('Entering running state'),
        onExit: () => console.log('Exiting running state'),
    },
    jumping: {
        onEnter: () => console.log('Entering jumping state'),
        onExit: () => console.log('Exiting jumping state'),
    },
    falling: {
        onEnter: () => console.log('Entering falling state'),
        onExit: () => console.log('Exiting falling state'),
    },
    attacking: {
        onEnter: () => console.log('Entering attacking state'),
        onExit: () => console.log('Exiting attacking state'),
    },
};

const playerStateMachine = new PlayerStateMachine(playerStates);
playerStateMachine.changeState('running');
playerStateMachine.changeState('jumping');
