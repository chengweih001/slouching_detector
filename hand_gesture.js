import { GestureRecognizer, FilesetResolver, DrawingUtils } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
let gestureRecognizer;
let lastKnowncategoryName = 'None';
let runningMode = "IMAGE";
let enableWebcamButton;
let webcamRunning = false;
const videoHeight = "360px";
const videoWidth = "480px";
// Before we can use HandLandmarker class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
const createGestureRecognizer = async () => {
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm");
    gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
            delegate: "GPU"
        },
        runningMode: runningMode
    });
};
createGestureRecognizer();
/********************************************************************
// Demo 2: Continuously grab image from webcam stream and detect it.
********************************************************************/
const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const gestureOutput = document.getElementById("gesture_output");
// Check if webcam access is supported.
function hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}
// If webcam supported, add event listener to button for when user
// wants to activate it.
if (!hasGetUserMedia()) {
    console.warn("getUserMedia() is not supported by your browser");
}

let timer = Date.now();
// Enable the live webcam view and start detection.
export function enableCam() {
    if (!gestureRecognizer) {
        alert("Please wait for gestureRecognizer to load");
        return;
    }
    webcamRunning = true;
    // getUsermedia parameters.
    const constraints = {
        video: true
    };
    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        video.srcObject = stream;
        video.addEventListener("loadeddata", predictWebcam);
    });
}
window.enableCam = enableCam;
let lastVideoTime = -1;
let results = undefined;
async function predictWebcam() {
    const webcamElement = document.getElementById("webcam");
    // Now let's start detecting the stream.
    if (runningMode === "IMAGE") {
        runningMode = "VIDEO";
        await gestureRecognizer.setOptions({ runningMode: "VIDEO", numHands: 10 });
    }
    let nowInMs = Date.now();
    if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        results = gestureRecognizer.recognizeForVideo(video, nowInMs);
    }
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    const drawingUtils = new DrawingUtils(canvasCtx);
    canvasElement.style.height = videoHeight;
    webcamElement.style.height = videoHeight;
    canvasElement.style.width = videoWidth;
    webcamElement.style.width = videoWidth;
    if (results.landmarks) {
        for (const landmarks of results.landmarks) {
            drawingUtils.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, {
                color: "#00FF00",
                lineWidth: 5
            });
            drawingUtils.drawLandmarks(landmarks, {
                color: "#FF0000",
                lineWidth: 2
            });
        }
    }
    canvasCtx.restore();
    if (results.gestures.length > 0) {
        gestureOutput.style.display = "block";
        gestureOutput.style.width = videoWidth;
        const output = [];
        for (let i = 0; i < results.gestures.length; ++i) {
            for (let j = 0; j < results.gestures[i].length; ++j) {
                const categoryName = results.gestures[i][j].categoryName;
                const categoryScore = parseFloat(results.gestures[i][j].score * 100).toFixed(2);
                const handedness = results.handednesses[i][j].displayName;
                output.push(`GestureRecognizer: ${categoryName}\n Confidence: ${categoryScore} %\n Handedness: ${handedness}`);

                if (categoryName != 'None') {
                    let now = Date.now();
                    // Gesture event is dispatched when:
                    // - category changed for the first time.
                    // - category remains the same over threshold.
                    let toDispatchEvent = false;
                    if (lastKnowncategoryName != categoryName) {
                        toDispatchEvent = true;
                        timer = now;                        
                    } else {
                        let threshold;
                        if (categoryName == 'Open_Palm') {
                            threshold = 1000;
                        } else {
                            threshold = 200;
                        }
                        // This would send event every `threshold` when user keeps the same gesture.
                        if (now - timer > threshold) {
                            toDispatchEvent = true;
                            timer = now;
                        }
                    }
                    if (toDispatchEvent) {
                        window.dispatchEvent(new CustomEvent('Gesture', {detail:{ categoryName: categoryName }}));
                    }
                    
                }
                lastKnowncategoryName = categoryName;
            }
        }
        gestureOutput.innerText = output.join('\n');
    }
    else {
        gestureOutput.style.display = "none";
    }
    // Call this function again to keep predicting when the browser is ready.
    if (webcamRunning === true) {
        window.requestAnimationFrame(predictWebcam);
    }
}
