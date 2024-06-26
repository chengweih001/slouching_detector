
let body, head, arms, legs, hips, eye, eye2, leftArm, leftPalm, rightArm, rightPalm, leftLeg, rightLeg, robotImage;
let heartRotateControl = null;
let heartBlinkControl = null;
let danceSpeed = 0.1;
let vRobotDancing = false;

document.addEventListener("DOMContentLoaded", (event) => {
    robotImage = document.querySelector('#robot-img'); 
    if (robotImage.contentDocument.querySelector('#body')){
        vRobotInit();
    }
    // In case the svg is not loaded, initiate again after it's loaded.
    robotImage.addEventListener("load", vRobotInit);
});

const vRobotInit = () => {
    body = robotImage.contentDocument.querySelector('#body')
    head = robotImage.contentDocument.querySelector('#head')
    arms = robotImage.contentDocument.querySelector('#arms')
    leftArm = robotImage.contentDocument.querySelector("#left-arm");
    leftPalm = robotImage.contentDocument.querySelector("#left-palm");
    rightArm = robotImage.contentDocument.querySelector("#right-arm");
    rightPalm = robotImage.contentDocument.querySelector("#right-palm");
    legs = robotImage.contentDocument.querySelector('#legs')
    leftLeg = robotImage.contentDocument.querySelector('#left-leg')
    rightLeg = robotImage.contentDocument.querySelector('#right-leg')
    hips = robotImage.contentDocument.querySelector('#hips')

    eye =  robotImage.contentDocument.querySelector('#eye-1')
    heart = robotImage.contentDocument.querySelector('#heart');

    heartRotateControl = gsap.to(heart, { 
        duration: 2,   // Animation time in seconds
        rotation: 360, // Rotate a full circle,
        transformOrigin: "50% 50%",  // Rotate around the center,
        repeat:-1,
        paused: true,
    });        

    heartBlinkControl = gsap.to(heart, { 
        duration: 0.5,     // How long each blink takes
        opacity: 0,        // Fade out
        repeat: -1,        // Repeat indefinitely
        yoyo: true,        // Reverse the animation (fade back in)
        ease: "power1.inOut", // Smooth easing for a natural blink 
        paused: true,        
    });           

    vRobotSleep(); 
    vRobotHeartBlink(false);
}

const vRobotMoveDown = async () => {
    await gsap.to([body, head, arms, legs, hips], 0.3, {y: '20px', yoyo: false, repeat: 0});
    return vRobotSleep();
}

const vRobotMoveUp = async () => {
    await gsap.to([body, head, arms, legs, hips], 0.3, {y: '0px', yoyo: false, repeat: 0});
    await vRobotWake();

}
const vRobotBlink = async () => {
    await gsap.to([eye], 0.2, { scaleY: 0, yoyo: true, repeat: 1, transformOrigin: 'center'})
} 

const vRobotSleep = async () => {
    heartRotateControl.pause();  
    vRobotHeartBlink(true);
    await gsap.to([eye], 0.2, { scaleY: 0.01, yoyo: false, repeat: 0, transformOrigin: 'center'})
  }
  
const vRobotWake = async () => {

    heartRotateControl.resume();
    vRobotHeartBlink(false);
    await gsap.to([eye], 0.2, { scaleY: 1, yoyo: false, repeat: 0, transformOrigin: 'center'})
}
let vRobotWaving = false;
const vRobotWave = async () => {
    if (vRobotDancing || vRobotWaving){
        return;
    }

    console.log("wave");
    vRobotWaving = true;
    const newPath = 'M 40 130 c -30,0 -30, -20 -30, -60';
    const originalPath = 'M 40 130 c -30,0 -30, 20 -30, 60';
    gsap.to(leftArm, 0.2, {attr: {d: newPath}, repeat:0});
    await gsap.to(leftPalm, 0.2, { x: '-3px', y: "-134px", repeat:0, rotation: 180, transformOrigin: "center"});
    await gsap.to(leftPalm, 0.1, {rotation: 200, transformOrigin:"top"});
    await gsap.to(leftPalm, 0.1, {rotation: 160, transformOrigin:"top"});
    await gsap.to(leftPalm, 0.1, {rotation: 200, transformOrigin:"top"});
    await gsap.to(leftPalm, 0.1, {rotation: 160, transformOrigin:"top"});
    await gsap.to(leftPalm, 0.1, {rotation: 180, transformOrigin:"top"});
    gsap.to(leftArm, 0.2, {attr: {d: originalPath}, repeat:0});
    await gsap.to(leftPalm, 0.2, { x: '0px', y: "0px", repeat:0, rotation: 0, transformOrigin: "center"});
    vRobotWaving = false;
}

const vRobotHeartBlink = async (blink) => {
    if (blink) {
        heartBlinkControl.resume();
    } else {
        heartBlinkControl.pause();
        await gsap.set(heart, { opacity:1});        
    }
}
const vRobotDance = async () => {
    await gsap.to(leftPalm, 0.05, { x: '0px', y: "0px", repeat:0, rotation: 0, transformOrigin: "center"});
    vRobotDancing = true;
    const originalPath = 'M 40 130 c -30,0 -30, 20 -30, 60';
    const newPath = 'M 40 130 c -50, 20 -70, -10 -70, -10';
    const newPath2 = 'M 40 130 c -50, -20 -70, 10 -70, 10';

    const rightOriginalPath = 'M 130 130 c 30,0 30, 20 30, 60';
    const rightNewPath = 'M 130 130 c 50, 20, 70, -10 70, -10';
    const rightNewPath2 = 'M 130 130 c 50, -20 70, 10 70, 10';

    danceRight = true;
    danceTime = 0
    while(true){
        // dance for 5 times is for debugging when not in dancing state.
        if (danceTime >= 5 && curStage!=State.DANCING){
            break;
        }
        danceTime+=1;
        if (danceRight){
            gsap.to(leftLeg, danceSpeed*2, {attr: {d: "M 65 200 l0,0 24, 20, -24, 48"}})
            gsap.to(rightLeg, danceSpeed*2, {attr: {d: "M 102 200 l0,0 24, 20 -24,48"}})
        } else {
            gsap.to(leftLeg, danceSpeed*2, {attr: {d: "M 65 200 l0,0 -24, 20, 24, 48"}})
            gsap.to(rightLeg, danceSpeed*2, {attr: {d: "M 102 200 l0,0 -24, 20 24,48"}})
        }
        danceRight = !danceRight;
        gsap.to(leftPalm, danceSpeed, {x: '-40px', y:'-75px', rotation: 145, repeat:0})
        gsap.to(leftArm, danceSpeed, {attr: {d: newPath}, repeat:0});
        gsap.to(rightPalm, danceSpeed, {x: '50px', y:'-50px', rotation: -145, repeat:0})
        await gsap.to(rightArm, danceSpeed, {attr: {d: rightNewPath}, repeat:0});

        gsap.to(leftPalm, danceSpeed, {x: '-50px', y:'-48px', rotation: 43, repeat:0})
        gsap.to(leftArm, danceSpeed, {attr: {d: newPath2}, repeat:0});
        gsap.to(rightPalm, danceSpeed, {x: '45px', y:'-45px', rotation: -50, repeat:0})
        await gsap.to(rightArm, danceSpeed, {attr: {d: rightNewPath2}, repeat:0});
    }

    // reset back.
    gsap.to(leftLeg, 0.2, {attr: {d: "M 65 200 l0,0 0, 48"}})
    gsap.to(rightLeg, 0.2, {attr: {d: "M 102 200 l0,0 0,48"}})
    gsap.to(leftArm, 0.2, {attr: {d: originalPath}, repeat:0});
    gsap.to(leftPalm, 0.2, { x: '0px', y: "0px", repeat:0, rotation: 0});
    gsap.to(rightArm, 0.2, {attr: {d: rightOriginalPath}, repeat:0});
    vRobotDancing = false;
    await gsap.to(rightPalm, 0.2, { x: '0px', y: "0px", rotation: 0, repeat:0});
}
  

// TODO: just rotate for now, hook up proper dance later.
const vRobotStartDancing = async () => {
    await vRobotMoveUp();
    heartRotateControl.duration(0.1);
    await vRobotDance();
}

const vRobotStopDancing = async () => {
    heartRotateControl.duration(2);
    danceSpeed = 0.1;
}


const vRobotDanceFaster = () => {
    danceSpeed /= 1.2;
}


const vRobotDanceSlower = () => {
    danceSpeed *= 1.2;
}