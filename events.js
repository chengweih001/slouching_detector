let stage1TimeoutId;
let stage2TimeoutId;
let stage3TimeoutId;
let prompStandingIntervalId;
const State = Object.freeze({
    INITIALIZING: Symbol("initializing"),
    NOT_SLOUCHING: Symbol("not slouching"),
    SLOUCH_STARTED: Symbol("stage 0 - just started slouching"),
    SOFT_NOTICE: Symbol("stage 1 - soft notice"),
    VOICE_NOTICE: Symbol("stage 2 - voice warning"),
    STANDUP_NOTICE: Symbol("stage 3 - prompted to stand up and dance"),
    DANCING: Symbol("stage 4 - user is dancing"),
    STANDING: Symbol("user is standing")
});
let curStage = State.INITIALIZING;

let songElement = document.getElementById('song');
songElement.addEventListener('pause', () => {
    curStage = State.NOT_SLOUCHING;
});
songElement.addEventListener('ended', () => {
    curStage = State.NOT_SLOUCHING;
});

document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener(
        "postureChanged",
        (e) => {
            // TODO: not handle posture change during dancing.
            if (e.detail.newPosture == SLOUCHING){
                curStage = State.SLOUCH_STARTED;

                stage1TimeoutId = setTimeout(() => {
                    document.dispatchEvent(new Event("slouchStage1"));
                }, 5000);
                stage2TimeoutId = setTimeout(() => {
                    document.dispatchEvent(new Event("slouchStage2"));
                }, 10000);
                stage3TimeoutId = setTimeout(() => {
                    document.dispatchEvent(new Event("slouchStage3"));
                }, 15000);
            } else {
                clearInterval(prompStandingIntervalId);                
                if (curStage == State.STANDUP_NOTICE && e.detail.newPosture == STANDING) {
                    document.dispatchEvent(new Event("robotDance"));
                    return;
                } 
                // When in initializing state we don't do anything when posture change.
                // In stage3 we already about to start dance sequence so ignoring to posture change for now.
                if(curStage == State.INITIALIZING || curStage == State.STANDUP_NOTICE){
                    return;
                }
                clearTimeout(stage1TimeoutId);
                clearTimeout(stage2TimeoutId);
                clearTimeout(stage3TimeoutId);

                // Only say awesome when user transition from slouch stage 1/2 to not slouching no matter sit straight or stand up.
                if(curStage == State.SLOUCH_STARTED || curStage == State.VOICE_NOTICE){
                    Speak("awesome");
                }
                curStage = State.NOT_SLOUCHING;
            }
        },
        false,
    );

    document.addEventListener(
        "slouchStage1",
        (e) => {
            curStage = State.SOFT_NOTICE;
            Speak("stage1")
        },
        false,
    );

    document.addEventListener(
        "slouchStage2",
        (e) => {
            curStage = State.VOICE_NOTICE;
            Speak("stage2");
    },
        false,
    );

    document.addEventListener(
        "slouchStage3",
        (e) => {
            prompStandingIntervalId = setInterval(() => {
                Speak("stage3");
            }, 5000);
            curStage = State.STANDUP_NOTICE;
        },
        false,
    );

    document.addEventListener(
        "robotDance",
        (e) => {
            Speak("robotDance");
            curStage = State.DANCING;

            // Play dance music.            
            songElement.play();
        },
        false,
    )

    window.addEventListener(
        "robotInitDone",
        async (e) => {
            curStage = State.NOT_SLOUCHING;
            Speak("hi");
            await window.robotCoach.wave(360);
        },
        false,
    )

    window.addEventListener(
        "robotInitFailed",
        (e) => {
            Speak("oops");
        },
        false,
    )    

    window.addEventListener('HeySpiky', event => {
        console.log(`Recognize HeySpiky with action ${event.detail.action}`);
        if (curStage == State.DANCING && !songElement.paused ) {
            console.log(`We are in dancing stage and voice recognition triggered.`);
            if (event.detail.action === 'faster') {
                if(songElement.playbackRate + 0.2 <= 3) {
                    songElement.playbackRate += 0.2;
                }
            }
            if (event.detail.action === 'slower') {
                if(songElement.playbackRate - 0.2 >= 0.2) {
                    songElement.playbackRate -= 0.2;
                }
            }
            if (event.detail.action === 'stop') {
                songElement.pause();
                songElement.currentTime = 0;
                curStage = State.NOT_SLOUCHING;
            }
        }
    });
});
