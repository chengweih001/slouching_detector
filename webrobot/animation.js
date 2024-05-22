
let body, head, arms, legs, hips, eye, eye2, leftArm, leftPalm;

document.addEventListener("DOMContentLoaded", (event) => {
    const robotImage = document.querySelector('#robot-img'); 
    body = robotImage.contentDocument.querySelector('#body')
    head = robotImage.contentDocument.querySelector('#head')
    arms = robotImage.contentDocument.querySelector('#arms')
    leftArm = robotImage.contentDocument.querySelector("#left-arm");
    leftPalm = robotImage.contentDocument.querySelector("#left-palm");
    legs = robotImage.contentDocument.querySelector('#legs')
    hips = robotImage.contentDocument.querySelector('#hips')

    eye =  robotImage.contentDocument.querySelector('#eye-1')
    eye2 =  robotImage.contentDocument.querySelector('#eye-2')
    vRobotSleep();        
});
const vRobotMoveDown = async () => {
    await gsap.to([body, head, arms, legs, hips], 0.3, {y: '20px', yoyo: false, repeat: 0});
    return vRobotSleep();
}

const vRobotMoveUp = async () => {
    await gsap.to([body, head, arms, legs, hips], 0.3, {y: '0px', yoyo: false, repeat: 0});
    return vRobotWake();

}
const vRobotBlink = async () => {
    return gsap.to([eye, eye2], 0.2, { scaleY: 0, yoyo: true, repeat: 1, transformOrigin: 'center'})
} 

const vRobotSleep = async () => {
    console.log(eye);
    console.log(eye2);
    return gsap.to([eye, eye2], 0.2, { scaleY: 0.01, yoyo: false, repeat: 0, transformOrigin: 'center'})
  }
  
const vRobotWake = async () => {
    return gsap.to([eye, eye2], 0.2, { scaleY: 1, yoyo: false, repeat: 0, transformOrigin: 'center'})
}

const vRobotWave = async () => {
    const newPath = 'M 34.804 138.278 L 34.804 123.622 C 30.943 122.942 27.346 121.188 24.411 118.556 C 21.686 116.001 19.566 112.853 18.213 109.348 C 16.404 104.909 15.525 99.975 15.167 95.31 C 14.723 89.014 15.014 82.687 16.032 76.46 L 0.404 76.46 C -0.261 85.22 -0.061 92.732 0.813 99.188 C 1.78 106.464 3.566 112.383 5.83 117.199 C 10.359 126.827 16.804 132.053 22.463 134.89 C 29.187 138.278 34.804 138.278 34.804 138.278 Z';
    const originalPath = 'M34.7945411,124 L34.7945411,138.655783 C30.9343023,139.336321 27.3364427,141.090142 24.4021377,143.721688 C21.6765099,146.277381 19.5574202,149.42552 18.2038944,152.929855 C16.3951047,157.369002 15.516284,162.302958 15.158246,166.968304 C14.7141944,173.264205 15.0044906,179.591215 16.0231171,185.818185 L0.394988307,185.818185 C-0.269939518,177.057703 -0.0699961863,169.546025 0.80417466,163.089941 C1.77134241,155.813887 3.55688286,149.895024 5.82135734,145.07888 C10.3503063,135.451303 16.7949914,130.225173 22.4538526,127.388266 C29.1775284,124 34.7945411,124 34.7945411,124 Z';
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

  