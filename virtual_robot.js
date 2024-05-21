class VirtualRobot {
    constructor() {
    }

    async close() {
        console.log('[virtual robot] close');
    }

    async resetMotors() {
        console.log('[virtual robot] resetMotors');
    }

    async slouch() {
        console.log('[virtual robot] slouch');
        vRobotMoveDown();
    }

    async stand() {
        console.log('[virtual robot] stand');
        vRobotMoveUp();
    }

    async wave(degrees) {
        console.log('[virtual robot] wave');
    }

    async startDancing() {
        console.log('[virtual robot] startDancing');
    }

    async stopDancing() {
        console.log('[virtual robot] stopDancing');
    }

    async danceFaster() {
        console.log('[virtual robot] danceFaster');
    }

    async danceSlower() {
        console.log('[virtual robot] danceSlower');
    }

    async beep(frequency, duration, volume) {
        console.log('[virtual robot] beep');
    }

    async mildAlert(volume) {
        console.log('[virtual robot] mildAlert');
    }

    async writeMessage(message) {
        console.log('[virtual robot] writeMessage');
    }
}
