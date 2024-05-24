// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

// the link to your model provided by Teachable Machine export panel
// const URL = "https://teachablemachine.withgoogle.com/models/RxJBvWzam/";
const URL = "./my-pose-model/";

const NOSE = 'nose';
const LEFT_EYE = 'leftEye';
const RIGHT_EYE = 'rightEye';
const LEFT_EAR = 'leftEar';
const RIGHT_EAR = 'rightEar';
const LEFT_SHOULDER = 'leftShoulder';
const RIGHT_SHOULDER = 'rightShoulder';
const LEFT_ELBOW = 'leftElbow';
const RIGHT_ELBOW = 'rightElbow';
const LEFT_WRIST = 'leftWrist';
const RIGHT_WRISE = 'rightWrist';
const LEFT_HIP = 'leftHip';
const RIGHT_HIP = 'rightHip';
const LEFT_KNEE = 'leftKnee';
const RIGHT_KNEE = 'rightKnee';
const LEFT_ANKLE = 'leftAnkle';
const RIGHT_ANKLE = 'rightAnkle';

const NOSE_IDX = 0;
const LEFT_EYE_IDX = 1;
const RIGHT_EYE_IDX = 2;
const LEFT_EAR_IDX = 3
const RIGHT_EAR_IDX = 4
const LEFT_SHOULDER_IDX = 5;
const RIGHT_SHOULDER_IDX = 6;
const LEFT_ELBOW_IDX = 7;
const RIGHT_ELBOW_IDX = 8;
const LEFT_WRIST_IDX = 9;
const RIGHT_WRISE_IDX = 10;
const LEFT_HIP_IDX = 11;
const RIGHT_HIP_IDX = 12;
const LEFT_KNEE_IDX = 13;
const RIGHT_KNEE_IDX = 14;
const LEFT_ANKLE_IDX = 15;
const RIGHT_ANKLE_IDX = 16;

const UNKNOWN_POSTURE = 'unknown posture';
const SLOUCHING = 'slouching';
const SITTING_STRAIGHT = 'sitting straight';
const STANDING = 'standing';

const MIN_POSTURE_DURATION_MS = 500;

let standing = null;
let currPosture = UNKNOWN_POSTURE;
let lastPosture = null;
let lastPostureTime = null;

let model, webcam, ctx, labelContainer, maxPredictions;

async function initializePostureDetection() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // Note: the pose library adds a tmPose object to your window (window.tmPose)
    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const size = 400;
    const flip = true; // whether to flip the webcam
    webcam = new tmPose.Webcam(size, size, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append/get elements to the DOM
    const canvas = document.getElementById("canvas");
    canvas.width = size; canvas.height = size;
    ctx = canvas.getContext("2d");
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }
}

async function loop(timestamp) {
    webcam.update(); // update the webcam frame
    // Stop posture detection during initialization.
    if(curStage != State.INITIALIZING){
        await predict();
    }
    window.requestAnimationFrame(loop);
}
async function predict() {
    labels = {
        "Class 1": "straight",
        "Class 2": "slouch",
        "Class 3": "standing",
    }
    // Prediction #1: run input through posenet
    // estimatePose can take in an image, video or canvas html element
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    // Prediction 2: run input through teachable machine classification model
    const prediction = await model.predict(posenetOutput);
    const now = Date.now();
    for (let i = 0; i < maxPredictions; i++) {
        const label =  labels[prediction[i].className];
        const prob = prediction[i].probability.toFixed(2);
        if (prob>0.95){
            let newPosture;
            if (label ==='slouch'){
                newPosture = SLOUCHING;
            } else if (label === 'straight'){
                newPosture = SITTING_STRAIGHT;
            } else if (label === 'standing'){
                newPosture = STANDING;
            }
            if (newPosture !== lastPosture) {
                lastPosture = newPosture;
                lastPostureTime = now;
            } else if (currPosture !== newPosture && (now - lastPostureTime) > MIN_POSTURE_DURATION_MS){
                postureChanged(newPosture);
            }
        }
        const classPrediction =
            label + ": " + prob;
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }

    if (curStage == State.DANCING){
        updateDanceScore(pose);
    }

    // finally draw the poses
    drawPose(pose);
}
    
function postureChanged(newPosture){
    if (newPosture == currPosture) {
        return;
    }
    document.dispatchEvent(new CustomEvent("postureChanged",{detail: {newPosture: newPosture}}));
    console.log(`posture changed to ${newPosture} from ${currPosture}`);
    currPosture = newPosture;
    // notifyMe();
}

function drawPose(pose) {
    if (webcam.canvas) {
        ctx.drawImage(webcam.canvas, 0, 0);
        // draw the keypoints and skeleton
        if (pose) {
            const minPartConfidence = 0.5;
            tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
            tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
        }
    }
}

let danceScore = 0;
let prevPosition = {leftElbow: null, rightElbow:null}
let danceScoreTimer;
function updateDanceScore(pose){
    if (!danceScoreTimer){
        danceScoreTimer = Date.now();
    }
    if (pose){
        for (let position of pose.keypoints){
            const part = position.part;
            if (part === 'leftElbow' || part==='rightElbow'){
                if (position.score > 0.8) {
                    if (prevPosition[part]){
                        danceScore += Math.abs((position.position.x-prevPosition[part].x)*(position.position.y-prevPosition[part].y));
                        console.log(`current dance score is ${100 * danceScore / (Date.now() - danceScoreTimer)}`);
                    }
                    prevPosition[part] = position.position;
                } else {
                    prevPosition[part] = null;
                }
            }
        }
    }
}

function getDanceScore(){
    let score = danceScore / (Date.now() - danceScoreTimer)*100;
    console.log(danceScore);
    console.log(score);
    if (!localStorage['highest_score'] || localStorage['highest_score']<score){
        localStorage['highest_score'] = score;
    }
    danceScoreTimer = null;
    danceScore = 0;
    document.getElementById("scoreboard").className = "";
    document.getElementById("score").innerText = Math.round(localStorage['highest_score']);
    document.dispatchEvent(new CustomEvent("danceScored",{detail: {score: score}}));
}
