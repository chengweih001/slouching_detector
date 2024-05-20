let port = null;

async function requestSerialPort() {
    if (navigator.serial) {
        navigator.serial.requestPort();
    } else {
        throw new Error('Web Serial is not available!');
    }
}