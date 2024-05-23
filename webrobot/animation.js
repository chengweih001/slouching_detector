
let body, head, arms, legs, hips, eye, eye2, leftArm, leftPalm, rightArm, rightPalm, leftLeg, rightLeg, robotImage;
let heartRotateControl = null;
let heartBlinkControl = null;
let robotDanceControl = null;
let danceSpeed = 0.1;

document.addEventListener("DOMContentLoaded", (event) => {
    robotImage = document.querySelector('#robot-img'); 
    vRobotInit();
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
    return vRobotWake();

}
const vRobotBlink = async () => {
    return gsap.to([eye], 0.2, { scaleY: 0, yoyo: true, repeat: 1, transformOrigin: 'center'})
} 

const vRobotSleep = async () => {
    heartRotateControl.pause();  
    vRobotHeartBlink(true);
    return gsap.to([eye], 0.2, { scaleY: 0.01, yoyo: false, repeat: 0, transformOrigin: 'center'})
  }
  
const vRobotWake = async () => {
    heartRotateControl.resume();
    vRobotHeartBlink(false);
    return gsap.to([eye], 0.2, { scaleY: 1, yoyo: false, repeat: 0, transformOrigin: 'center'})
}

const vRobotWave = async () => {
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
    return gsap.to(leftPalm, 0.2, { x: '0px', y: "0px", repeat:0, rotation: 0, transformOrigin: "center"});
}

const vRobotHeartBlink = async (blink) => {
    if (blink) {
        heartBlinkControl.resume();
    } else {
        heartBlinkControl.pause();
        gsap.set(heart, { opacity:1});        
    }
}
const vRobotDance = async () => {
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
        if (danceTime >= 50 && curStage!=State.DANCING){
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
        gsap.to(leftPalm, danceSpeed, {x: '-48px', y:'-80px'})
        gsap.to(leftPalm, danceSpeed, {rotation: 145})
        gsap.to(leftArm, danceSpeed, {attr: {d: newPath}, repeat:0});
        gsap.to(rightPalm, danceSpeed, {x: '50px', y:'-50px'})
        gsap.to(rightPalm, danceSpeed, {rotation: -145})
        await gsap.to(rightArm, danceSpeed, {attr: {d: rightNewPath}, repeat:0});

        gsap.to(leftPalm, danceSpeed, {x: '-50px', y:'-48px'})
        gsap.to(leftPalm, danceSpeed, {rotation: 50})
        gsap.to(leftArm, danceSpeed, {attr: {d: newPath2}, repeat:0});
        gsap.to(rightPalm, danceSpeed, {x: '45px', y:'-40px'})
        gsap.to(rightPalm, danceSpeed, {rotation: -50})
        await gsap.to(rightArm, danceSpeed, {attr: {d: rightNewPath2}, repeat:0});
    }

    // reset back.
    gsap.to(leftLeg, 0.2, {attr: {d: "M 65 200 l0,0 0, 48"}})
    gsap.to(rightLeg, 0.2, {attr: {d: "M 102 200 l0,0 0,48"}})
    gsap.to(rightPalm, 0.1, {rotation: 0})
    gsap.to(leftPalm, 0.1, {rotation: 0})
    gsap.to(leftArm, 0.2, {attr: {d: originalPath}, repeat:0});
    gsap.to(leftPalm, 0.2, { x: '0px', y: "0px", repeat:0});
    gsap.to(rightArm, 0.2, {attr: {d: rightOriginalPath}, repeat:0});
    return gsap.to(rightPalm, 0.2, { x: '0px', y: "0px", repeat:0});
}
  

// TODO: just rotate for now, hook up proper dance later.
const vRobotStartDancing = async () => {
    vRobotMoveUp();
    heartRotateControl.duration(0.1);

    // TODO: alternate movements.
    // robotDanceControl = gsap.to([body, head, arms, legs, hips], { 
    //     duration: 2,   // Animation time in seconds
    //     rotation: 360, // Rotate a full circle,
    //     transformOrigin: "50% 50%",  // Rotate around the center,
    //     repeat:-1,
    // });
    vRobotDance();
}

const vRobotStartStopDancing = async () => {
    if (!robotDanceControl) {
        return;
    }
    robotDanceControl.pause();
    heartRotateControl.duration(0.8);
}


const vRobotDanceFaster = () => {
    danceSpeed /= 2;
}


const vRobotDanceSlower = () => {
    danceSpeed *= 2;
}