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

