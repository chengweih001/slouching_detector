async function connectSerialPort() {
    if (!navigator.serial) {
        console.log('Web serial not available');
    }
    const port = await navigator.serial.requestPort();
    try {
        await port.open({ baudRate: 115200 });
    } catch (error) {
        console.log('Error opening serial port: ', error);
        return null;
    }
    if (!port.readable) {
        console.log('Serial port not readable');
        return null;
    }
    console.log('Opened serial port');
    return port;
}

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
        'motor.run_for_degrees(port.B, d, 1000)'
    ].join('\n'));
}

async function requestSerialPort() {
    const port = await connectSerialPort();
    if (port) {
        const CTRL_C = '\x03';  // Ctrl+C character
        await writeLinesToSerialPort(port, [CTRL_C]);
        await resetMotors(port);
    }
}
