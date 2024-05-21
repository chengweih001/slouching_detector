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
    document.body.addEventListener(
        "postureChanged",
        (e) => {
            if (e.detail.newPosture == SLOUCHING){
                Speak("No Slouching");
                curStage = State.SLOUCH_STARTED;

                stage1TimeoutId = setTimeout(() => {
                    document.body.dispatchEvent(new Event("slouchStage1"));
                }, 2000);
                stage2TimeoutId = setTimeout(() => {
                    document.body.dispatchEvent(new Event("slouchStage2"));
                }, 6000);
                stage3TimeoutId = setTimeout(() => {
                    document.body.dispatchEvent(new Event("slouchStage3"));
                }, 10000);
            } else {
                Speak("Good!");
                curStage = State.NOT_SLOUCHING;
                clearTimeout(stage1TimeoutId);
                clearTimeout(stage2TimeoutId);
                clearTimeout(stage3TimeoutId);
            }
        },
        false,
    );

    document.body.addEventListener(
        "slouchStage1",
        (e) => {
            Speak("stage 1 - beep beep")
            curStage = State.SOFT_NOTICE;
        },
        false,
    );

    document.body.addEventListener(
        "slouchStage2",
        (e) => {
            Speak("stage 2 - please sit up straight!");
            curStage = State.VOICE_NOTICE;
    },
        false,
    );

    document.body.addEventListener(
        "slouchStage3",
        (e) => {
            Speak("stage 3 - stand up and dance with me!");
            curStage = State.STANDUP_NOTICE;
        },
        false,
    );

    document.body.addEventListener(
        "robotDance",
        (e) => {
            Speak("robot is dancing");
            curStage = State.DANCING;

            // Play dance music.
            const audioElement = document.getElementById('song');
            audioElement.play();
        },
        false,
    )

});
