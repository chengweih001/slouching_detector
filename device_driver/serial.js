async function writeLinesToSerialPort(port, lines) {
    const textEncoder = new TextEncoderStream();
    const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
    const writer = textEncoder.writable.getWriter();
    for (const line of lines) {
        writer.write(line);
    }
    writer.close();
    await writableStreamClosed;
}

function appendSerialLog(message) {
    const serialLog = document.getElementById('serial-log');
    if (serialLog) {
        serialLog.value += message;
    }
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
        this.danceMode_ = false;
        this.queue_ = [];

        this.blinkIntervalId_ = null;
        this.lastBlink_ = Date.now();
        this.inverted_ = false;
        this.initialized_ = false;

        this.readSerial();

        document.addEventListener('danceScored', event => {
            this.writeMessage(`SCORE ${event.detail.score.toFixed(0)}`);
        });
    }

    async initPython() {
        try {
            const CTRL_C = '\x03';  // Ctrl+C character
            await writeLinesToSerialPort(this.port_, [CTRL_C]);
            await this.runPythonOnRobot([
                'from hub import sound, port, light_matrix',
                'import motor, time',
                'light_matrix.set_orientation(1)',
                'light_matrix.write("ON", 100, 750)'
            ].join('\n'));

            this.resetMotors();
            // Give ourselves 2 seconds to reset motors
            if (!this.initialized_) {
                setTimeout(() => {
                    window.dispatchEvent(new Event("robotInitDone"));
                }, 2000);
            }
        } catch (error) {
            console.log('initPython error:', error);
            if (!this.initialized_) {
                window.dispatchEvent(new Event("robotInitFailed"));
            }
        }
        this.initialized_ = true;
    }

    async close() {
        await this.port_.close();
        this.port_ = null;
    }

    async readSerial() {
        while (this.port_ && this.port_.readable && !this.port_.readable.locked) {
            const reader = this.port_.readable.getReader();
            let result = null;
            try {
                result = await reader.read();
            } finally {
                reader.releaseLock();
            }
            if (result !== null) {
                const decoder = new TextDecoder();
                appendSerialLog(decoder.decode(result.value));
            }
        }
    }

    async runPythonOnRobot(code) {
        this.queue_.push(code);
        if (this.port_.writable.locked) {
            return;
        }
        while (this.queue_.length > 0) {
            code = this.queue_.shift();
            const CTRL_D = '\x04';  // Ctrl+D character
            const CTRL_E = '\x05';  // Ctrl+E character
            console.log(`Sending to RobotCoach:\n${code}`)
            await writeLinesToSerialPort(this.port_, [CTRL_E, code, CTRL_D]);
        }
    }

    resetMotors() {
        this.danceMode_ = false;
        this.runPythonOnRobot([
            `d = motor.absolute_position(${this.danceMotor_})`,
            `d = (${this.standAngle_} - d) % 360`,
            'if d > 180:',
            '  d -= 360',
            `motor.stop(${this.danceMotor_})`,
            `motor.run_for_degrees(${this.danceMotor_}, d, 100)`,
            `d = motor.absolute_position(${this.waveMotor_})`,
            `d = (${this.waveMotorIdle_} - d) % 360`,
            `if d > 180:`,
            '  d -= 360',
            `motor.stop(${this.waveMotor_})`,
            `motor.run_for_degrees(${this.waveMotor_}, d, 100)`
        ].join('\n'));
    }

    slouch() {
        if (!this.danceMode_) {
            this.runPythonOnRobot([
                `d = (${this.slouchAngle_} - motor.absolute_position(${this.danceMotor_})) % 360`,
                'if d > 180:',
                '  d -= 360',
                `motor.run_for_degrees(${this.danceMotor_}, d, 500)`
            ].join('\n'));
        }
    }

    stand() {
        if (!this.danceMode_) {
            this.runPythonOnRobot([
                `d = (${this.standAngle_} - motor.absolute_position(${this.danceMotor_})) % 360`,
                'if d > 180:',
                '  d -= 360',
                `motor.run_for_degrees(${this.danceMotor_}, d, 500)`
            ].join('\n'));
        }
    }

    wave(degrees) {
        if (!this.danceMode_) {
            this.runPythonOnRobot(`motor.run_for_degrees(${this.waveMotor_}, ${degrees}, ${this.waveSpeed_})`);
        }
    }

    startDancing() {
        this.runPythonOnRobot([
            `motor.run(${this.danceMotor_}, ${this.danceSpeed_ / 2})`,
            `motor.run(${this.waveMotor_}, ${this.danceSpeed_})`,
        ].join('\n'));
        this.danceMode_ = true;
        console.log(`dance speed is ${this.danceSpeed_}`);
        if (this.blinkIntervalId_) {
            clearInterval(this.blinkIntervalId_);
        }
        this.blinkIntervalId_ = setInterval(() => {
            const now = Date.now();
            const elapsed = now - this.lastBlink_;
            if (elapsed > 300000 / this.danceSpeed_) {
                if (this.inverted_) {
                    this.showLightMatrixImage(1);
                } else {
                    this.showLightMatrixImage(2);
                }
                this.inverted_ = !this.inverted_;
                this.lastBlink_ = now;
            }
        }, 100);
    }

    stopDancing() {
        if (this.danceMode_) {
            this.danceMode_ = false;
            this.clearLightMatrix();
            this.resetMotors();
        }
    }

    danceFaster() {
        if (this.danceMode_) {
            this.danceSpeed_ = Math.min(this.danceSpeed_ + 50, this.maxDanceSpeed_);
            this.startDancing();
        }
    }

    danceSlower() {
        if (this.danceMode_) {
            this.danceSpeed_ = Math.max(this.danceSpeed_ - 50, this.minDanceSpeed_);
            this.startDancing();
        }
    }

    beep(frequency, duration, volume) {
        if (!this.danceMode_) {
            this.runPythonOnRobot(`sound.beep(${frequency}, ${duration}, ${volume})`);
        }
    }

    mildAlert(volume) {
        if (!this.danceMode_) {
            this.runPythonOnRobot([
                `sound.beep(1046, 100, ${volume})`,  // C6
                'time.sleep_ms(100)',
                `sound.beep(880, 100, ${volume})`,  // A5
                'time.sleep_ms(100)',
                `sound.beep(1319, 100, ${volume})`,  // E6
                'time.sleep_ms(100)',
            ].join('\n'));
        }
    }

    writeMessage(message) {
        if (!this.danceMode_) {
            this.runPythonOnRobot(`light_matrix.write("${message}", 100, 750)`);
        }
    }

    clearLightMatrix() {
        if (!this.danceMode_) {
            this.runPythonOnRobot(`light_matrix.clear()`);
        }
    }

    showLightMatrixImage(pictogramKey) {
        if (this.danceMode_) {
            this.runPythonOnRobot(`light_matrix.show_image(${pictogramKey})`);
        }
    }
}
