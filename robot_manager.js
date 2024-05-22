class RobotManager {
    constructor() {
        this.robots = [];
    }

    addRobot(robot) {
        this.robots.push(robot);
    }

    async close() {
        this.robots.map(robot => robot.close());
    }

    async resetMotors() {
        this.robots.map(robot => robot.resetMotors());
    }

    async slouch() {
        this.robots.map(robot => robot.slouch());
    }

    async stand() {
        this.robots.map(robot => robot.stand());
    }

    async wave(degrees) {
        this.robots.map(robot => robot.wave(degrees));
    }

    async startDancing() {
        this.robots.map(robot => robot.startDancing());
    }

    async stopDancing() {
        this.robots.map(robot => robot.stopDancing());
    }

    async danceFaster() {
        this.robots.map(robot => robot.danceFaster());
    }

    async danceSlower() {
        this.robots.map(robot => robot.danceSlower());
    }

    async beep(frequency, duration, volume) {
        this.robots.map(robot => robot.beep(frequency, duration, volume));
    }

    async mildAlert(volume) {
        this.robots.map(robot => robot.mildAlert(volume));
    }

    async writeMessage(message) {
        this.robots.map(robot => robot.writeMessage(message));
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    window.robotCoach = new RobotManager();
    window.robotCoach.addRobot(new VirtualRobot());

    const connectSerialPort = async port => {
        if (port === window.robotSerialPort) {
            console.log('Port already selected');
            return;
        }
        try {
            await port.open({ baudRate: 115200 });
        } catch (error) {
            console.log('Error opening serial port: ', error);
            return;
        }
        console.log('Opened serial port');
        if (!port.readable) {
            console.log('Serial port not readable');
            return;
        }
        if (window.robotSerialPort) {
            await window.robotSerialPort.close();
        }
        let physicalRobot = new RobotCoach(port);
        console.log('Initializing RobotCoach');
        await physicalRobot.initPython();
        window.robotCoach.addRobot(physicalRobot);
    };

    const ports = await navigator.serial.getPorts();
    if (ports.length !== 0) {
        connectSerialPort(ports[0]);
    }

    const connectButton = document.getElementById('btn-connect');
    connectButton.onclick = async () => {
        const port = await navigator.serial.requestPort();
        if (port) {
            connectSerialPort(port);
        }
    };

    const slouchButton = document.getElementById('btn-slouch');
    slouchButton.onclick = () => {
        console.log('RobotCoach is slouching');
        if (window.robotCoach) {
            window.robotCoach.slouch();
        }
    };

    const standButton = document.getElementById('btn-stand');
    standButton.onclick = () => {
        console.log('RobotCoach is standing');
        if (window.robotCoach) {
            window.robotCoach.stand();
        }
    };

    const waveButton = document.getElementById('btn-wave');
    waveButton.onclick = () => {
        console.log('RobotCoach is waving');
        if (window.robotCoach) {
            window.robotCoach.wave(360);
        }
    };

    const danceButton = document.getElementById('btn-dance');
    danceButton.onclick = () => {
        console.log('RobotCoach is dancing');
        if (window.robotCoach) {
            const coach = window.robotCoach;
            window.robotCoach.startDancing();
        }
    };
});

document.addEventListener('postureChanged', event => {
    console.log(`RobotCoach got postureChanged with newPosture ${event.detail.newPosture}`);
    if (window.robotCoach) {
        if (event.detail.newPosture === 'slouching') {
            window.robotCoach.slouch();
        } else {
            window.robotCoach.stand();
        }
    }
});
document.addEventListener('slouchStage1', () => {
    console.log('RobotCoach got slouchStage1');
    if (window.robotCoach) {
        window.robotCoach.mildAlert(25);
    }
});
document.addEventListener('slouchStage2', () => {
    console.log('RobotCoach got slouchStage2');
    if (window.robotCoach) {
        window.robotCoach.wave(360);
    }
});

document.addEventListener('slouchStage3', () => {
    console.log('RobotCoach got slouchStage3');
    if (window.robotCoach) {
        window.robotCoach.startDancing();
    }
    document.dispatchEvent(new Event("robotDance"));
});

window.addEventListener('HeySpiky', event => {
    console.log(`RobotCoach got HeySpiky with action ${event.detail.action}`)});

window.addEventListener('HeySpike', event => {
    console.log(`RobotCoach got HeySpike with action ${event.detail.action}`);
    if (window.robotCoach) {
        if (event.detail.action === 'faster') {
            window.robotCoach.danceFaster();
        }
        if (event.detail.action === 'slower') {
            window.robotCoach.danceSlower();
        }
        if (event.detail.action === 'stop') {
            window.robotCoach.stopDancing();
        }
    }
});
window.addEventListener('openPalm', () => {
    if (window.robotCoach) {
        window.robotCoach.writeMessage('HI');
        window.robotCoach.wave(360);
    }
});
