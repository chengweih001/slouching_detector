async function writeLinesToSerialPort(port, lines) {
    const textEncoder = new TextEncoderStream();
    const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
    const writer = textEncoder.writable.getWriter();
    for (const line of lines) {
        console.log(`OUT: ${line}`);
        writer.write(line);
    }
    writer.close();
    await writableStreamClosed;
}

async function runPythonOnRobot(port, code) {
    const CTRL_D = '\x04';  // Ctrl+D character
    const CTRL_E = '\x05';  // Ctrl+E character
    await writeLinesToSerialPort(port, [CTRL_E, code, CTRL_D]);
}

async function resetMotors(port) {
    await runPythonOnRobot(port, [
        'd = (180 - motor.absolute_position(port.B)) % 360',
        'if d > 180:',
        '  d -= 360',
        'motor.run_for_degrees(port.B, d, 100)',
        'd = (180 - motor.absolute_position(port.D)) % 360',
        'if d > 180:',
        '  d -= 360',
        'motor.run_for_degrees(port.D, d, 100)'
    ].join('\n'));
}

async function slouch(port) {
    await runPythonOnRobot(port, [
        'd = (60 - motor.absolute_position(port.B)) % 360',
        'if d > 180:',
        '  d -= 360',
        'motor.run_for_degrees(port.B, d, 500)'
    ].join('\n'));
}

async function stand(port) {
    await runPythonOnRobot(port, [
        'd = (180 - motor.absolute_position(port.B)) % 360',
        'if d > 180:',
        '  d -= 360',
        'motor.run_for_degrees(port.B, d, 500)'
    ].join('\n'));
}

async function wave(port) {
    await runPythonOnRobot(port, 'motor.run_for_degrees(port.D, 360, 700)');
}

async function dance(port, duration, speed) {
    await runPythonOnRobot(port, [
        `motor.run(port.B, ${speed/2})`,
        `motor.run(port.D, ${speed})`,
        `time.sleep_ms(${duration})`,
        'motor.stop(port.B)',
        'motor.stop(port.D)',
    ].join('\n'));
}

async function initRobotSerialPort(port) {
    const CTRL_C = '\x03';  // Ctrl+C character
    await writeLinesToSerialPort(port, [CTRL_C]);
    await resetMotors(port);
}

async function connectSerialPort(port) {
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
    window.robotSerialPort = port;
    initRobotSerialPort(port);
}

document.addEventListener('DOMContentLoaded', async () => {
    window.robotSerialPort = null;

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
        console.log('slouch');
        if (window.robotSerialPort) {
            slouch(window.robotSerialPort);
        }
    };

    const standButton = document.getElementById('btn-stand');
    standButton.onclick = () => {
        console.log('stand');
        if (window.robotSerialPort) {
            stand(window.robotSerialPort);
        }
    };

    const waveButton = document.getElementById('btn-wave');
    waveButton.onclick = () => {
        console.log('wave');
        if (window.robotSerialPort) {
            wave(window.robotSerialPort);
        }
    };

    const danceButton = document.getElementById('btn-dance');
    danceButton.onclick = () => {
        console.log('dance');
        if (window.robotSerialPort) {
            await dance(window.robotSerialPort, 3000, 500);
            setTimeout(() => { resetMotors(window.robotSerialPort); }, 3000);
        }
    };

});
