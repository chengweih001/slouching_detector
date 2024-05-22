let stage1TimeoutId;
let stage2TimeoutId;
let stage3TimeoutId;
const State = Object.freeze({
    NOT_SLOUCHING:   Symbol("not slouching"),
    SLOUCH_STARTED:  Symbol("stage 0 - just started slouching"),
    SOFT_NOTICE: Symbol("stage 1 - soft notice"),
    VOICE_NOTICE: Symbol("stage 2 - voice warning"),
    STANDUP_NOTICE: Symbol("stage 3 - prompted to stand up and dance"),
    DANCING: Symbol("stage 4 - user is dancing"),
});
let curStage = State.NOT_SLOUCHING; // not slouching;
document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener(
        "postureChanged",
        (e) => {
            if (e.detail.newPosture == SLOUCHING){
                curStage = State.SLOUCH_STARTED;

                stage1TimeoutId = setTimeout(() => {
                    document.dispatchEvent(new Event("slouchStage1"));
                }, 2000);
                stage2TimeoutId = setTimeout(() => {
                    document.dispatchEvent(new Event("slouchStage2"));
                }, 6000);
                stage3TimeoutId = setTimeout(() => {
                    document.dispatchEvent(new Event("slouchStage3"));
                }, 10000);
            } else {
                Speak("awesome");
                curStage = State.NOT_SLOUCHING;
                clearTimeout(stage1TimeoutId);
                clearTimeout(stage2TimeoutId);
                clearTimeout(stage3TimeoutId);
            }
        },
        false,
    );

    document.addEventListener(
        "slouchStage1",
        (e) => {
            Speak("stage1")
        },
        false,
    );

    document.addEventListener(
        "slouchStage2",
        (e) => {
            Speak("stage2");
            curStage = State.VOICE_NOTICE;
    },
        false,
    );

    document.addEventListener(
        "slouchStage3",
        (e) => {
            Speak("stage3");
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
            const audioElement = document.getElementById('song');
            audioElement.play();
        },
        false,
    )

    document.addEventListener(
        "robotInitDone",
        async (e) => {
            Speak("hi");
            await window.robotCoach.wave(360);
        },
        false,
    )

    document.addEventListener(
        "robotInitFailed",
        (e) => {
            Speak("oops");
        },
        false,
    )    


});
