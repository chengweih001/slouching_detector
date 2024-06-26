class VirtualRobot {
    constructor() {
    }

    close() {
        console.log('[virtual robot] close');
    }

    resetMotors() {
        console.log('[virtual robot] resetMotors');
    }

    slouch() {
        console.log('[virtual robot] slouch');
        vRobotMoveDown();
    }

    stand() {
        console.log('[virtual robot] stand');
        vRobotMoveUp();
    }

    wave(degrees) {
        console.log('[virtual robot] wave');
        vRobotWave();
    }

    startDancing() {
        console.log('[virtual robot] startDancing');
        vRobotStartDancing();
    }

    stopDancing() {
        console.log('[virtual robot] stopDancing');
        vRobotStopDancing();
    }

    danceFaster() {
        console.log('[virtual robot] danceFaster');
        vRobotDanceFaster();
    }

    danceSlower() {
        console.log('[virtual robot] danceSlower');
        vRobotDanceSlower();
    }

    beep(frequency, duration, volume) {
        console.log('[virtual robot] beep');
    }

    mildAlert(volume) {
        console.log('[virtual robot] mildAlert');
    }

    writeMessage(message) {
        console.log('[virtual robot] writeMessage');
    }
}
