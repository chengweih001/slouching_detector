async function writeLinesToSerialPort(port, lines) {
    const textEncoder = new TextEncoderStream();
    const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
    const writer = textEncoder.writable.getWriter();
    for (const line of lines) {
        writer.write(line);
    }
    writer.close();
    console.log('wait for writableStreamClosed');
    await writableStreamClosed;
    console.log('writableStreamClosed');
}

class RobotCoach {
    constructor(port) {
        this.danceMotor_ = 'port.B';
        this.slouchAngle_ = 60;
        this.standAngle_ = 180;
        this.danceSpeed_ = 500;
        this.maxDanceSpeed_ = 1000;
        this.minDanceSpeed_ = 100;

        this.waveMotor_ = 'port.D';
        this.waveMotorIdle_ = 180;
        this.waveSpeed_ = 700;

        this.port_ = port;
        this.danceMode_ = null;
    }

    async initPython() {
        try {
            const CTRL_C = '\x03';  // Ctrl+C character
            await writeLinesToSerialPort(this.port_, [CTRL_C]);
            await this.runPythonOnRobot([
                'from hub import sound, port',
                'import motor, time'
            ].join('\n'));
            await this.resetMotors();
            document.dispatchEvent(new Event("robotInitDone"));
        } catch (error) {
            document.dispatchEvent(new Event("robotInitFailed"));
        }
    }

    async close() {
        await this.port_.close();
        this.port_ = null;
    }

    async runPythonOnRobot(code) {
        const CTRL_D = '\x04';  // Ctrl+D character
        const CTRL_E = '\x05';  // Ctrl+E character
        console.log(`RUN:\n${code}`)
        await writeLinesToSerialPort(this.port_, [CTRL_E, code, CTRL_D]);
    }

    async resetMotors() {
        await this.runPythonOnRobot([
            `motor.stop(${this.danceMotor_})`,
            `d = (${this.standAngle_} - motor.absolute_position(${this.danceMotor_})) % 360`,
            'if d > 180:',
            '  d -= 360',
            `motor.run_for_degrees(${this.danceMotor_}, d, 100)`,
            `motor.stop(${this.waveMotor_})`,
            `d = (${this.waveMotorIdle_} - motor.absolute_position(${this.waveMotor_})) % 360`,
            `if d > 180:`,
            '  d -= 360',
            `motor.run_for_degrees(${this.waveMotor_}, d, 100)`
        ].join('\n'));
    }

    async slouch() {
        await this.runPythonOnRobot([
            `d = (${this.slouchAngle_} - motor.absolute_position(${this.danceMotor_})) % 360`,
            'if d > 180:',
            '  d -= 360',
            `motor.run_for_degrees(${this.danceMotor_}, d, 500)`
        ].join('\n'));
    }

    async stand() {
        await this.runPythonOnRobot([
            `d = (${this.standAngle_} - motor.absolute_position(${this.danceMotor_})) % 360`,
            'if d > 180:',
            '  d -= 360',
            `motor.run_for_degrees(${this.danceMotor_}, d, 500)`
        ].join('\n'));
    }

    async wave(degrees) {
        await this.runPythonOnRobot(`motor.run_for_degrees(${this.waveMotor_}, ${degrees}, ${this.waveSpeed_})`);
    }

    async startDancing() {
        await this.runPythonOnRobot([
            `motor.run(${this.danceMotor_}, ${this.danceSpeed_ / 2})`,
            `motor.run(${this.waveMotor_}, ${this.danceSpeed_})`,
        ].join('\n'));
        this.danceMode_ = true;
        console.log(`dance speed is ${this.danceSpeed_}`);
    }

    async stopDancing() {
        if (this.danceMode_) {
            this.danceMode_ = false;
            await this.resetMotors();
        }
    }

    async danceFaster() {
        if (this.danceMode_) {
            this.danceSpeed_ = Math.min(this.danceSpeed_ + 50, this.maxDanceSpeed_);
            await this.startDancing();
        }
    }

    async danceSlower() {
        if (this.danceMode_) {
            this.danceSpeed_ = Math.max(this.danceSpeed_ - 50, this.minDanceSpeed_);
            await this.startDancing();
        }
    }

    async beep(frequency, duration, volume) {
        await this.runPythonOnRobot(`sound.beep(${frequency}, ${duration}, ${volume})`);
    }

    async mildAlert(volume) {
        await this.runPythonOnRobot([
            `sound.beep(1046, 100, ${volume})`,  // C6
            'time.sleep_ms(100)',
            `sound.beep(880, 100, ${volume})`,  // A5
            'time.sleep_ms(100)',
            `sound.beep(1319, 100, ${volume})`,  // E6
            'time.sleep_ms(100)',
        ].join('\n'));
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    window.robotCoach = null;

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
        window.robotCoach = new RobotCoach(port);
        console.log('Initializing RobotCoach');
        await window.robotCoach.initPython();
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
    danceButton.onclick = async () => {
        console.log('RobotCoach is dancing');
        if (window.robotCoach) {
            const coach = window.robotCoach;
            window.robotCoach.startDancing();
        }
    };

    const stopDanceButton = document.getElementById('btn-stop-dance');
    stopDanceButton.onclick = async () => {
        console.log('RobotCoach is stopping');
        if (window.robotCoach) {
            const coach = window.robotCoach;
            window.robotCoach.stopDancing();
        }
    };

    const danceFasterButton = document.getElementById('btn-dance-faster');
    danceFasterButton.onclick = async () => {
        console.log('RobotCoach is dancing faster');
        if (window.robotCoach) {
            const coach = window.robotCoach;
            window.robotCoach.danceFaster();
        }
    };

    const danceSlowerButton = document.getElementById('btn-dance-slower');
    danceSlowerButton.onclick = async () => {
        console.log('RobotCoach is dancing slower');
        if (window.robotCoach) {
            const coach = window.robotCoach;
            window.robotCoach.danceSlower();
        }
    };

    const beepButton = document.getElementById('btn-beep');
    beepButton.onclick = async () => {
        console.log('beep');
        if (window.robotCoach) {
            window.robotCoach.mildAlert(25);
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
document.addEventListener('robotDance', () => {
    console.log('RobotCoach got robotDance');
    if (window.robotCoach) {
        window.robotCoach.dance(3000);
    }
});
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
