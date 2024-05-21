
let body, head, arms, legs, hips, eye, eye2;

document.addEventListener("DOMContentLoaded", (event) => {
    body = document.querySelector('#body')
    head = document.querySelector('#head')
    arms = document.querySelector('#arms')
    legs = document.querySelector('#legs')
    hips = document.querySelector('#hips')

    eye = document.querySelector('#eye-1')
    eye2 = document.querySelector('#eye-2')
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
    const eye = document.querySelector('#eye-1')
    const eye2 = document.querySelector('#eye-2')
    
    gsap.to([eye, eye2], 0.2, { scaleY: 0.01, yoyo: false, repeat: 0, transformOrigin: 'center'})
  }
  
const vRobotWake = () => {
    const eye = document.querySelector('#eye-1')
    const eye2 = document.querySelector('#eye-2')

    gsap.to([eye, eye2], 0.2, { scaleY: 1, yoyo: false, repeat: 0, transformOrigin: 'center'})
}


  