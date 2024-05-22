
let body, head, arms, legs, hips, eye, eye2;

document.addEventListener("DOMContentLoaded", (event) => {
    const robotImage = document.querySelector('#robot-img'); 
    body = robotImage.contentDocument.querySelector('#body')
    head =  robotImage.contentDocument.querySelector('#head')
    arms =  robotImage.contentDocument.querySelector('#arms')
    legs =  robotImage.contentDocument.querySelector('#legs')
    hips =  robotImage.contentDocument.querySelector('#hips')

    eye =  robotImage.contentDocument.querySelector('#eye-1')
    eye2 =  robotImage.contentDocument.querySelector('#eye-2')
    vRobotSleep();        
});
const vRobotMoveDown = () => {
    gsap.to([body, head, arms, legs, hips], 0.3, {y: '20px', yoyo: false, repeat: 0});
    vRobotSleep();
}

const vRobotMoveUp = () => {
    gsap.to([body, head, arms, legs, hips], 0.3, {y: '0px', yoyo: false, repeat: 0});
    vRobotWake();

}
const vRobotBlink = () => {
    gsap.to([eye, eye2], 0.2, { scaleY: 0, yoyo: true, repeat: 1, transformOrigin: 'center'})
} 

const vRobotSleep = () => {    
    gsap.to([eye, eye2], 0.2, { scaleY: 0.01, yoyo: false, repeat: 0, transformOrigin: 'center'})
  }
  
const vRobotWake = () => {
    gsap.to([eye, eye2], 0.2, { scaleY: 1, yoyo: false, repeat: 0, transformOrigin: 'center'})
}


  