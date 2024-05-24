let recognition = undefined;
let enableSpeechRecognition = true;

function initializeSpeechRecognition() {
    let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    let stage = 1; // Current stage
    let timeoutId; // Timer ID for the timeout

    // Keywords for each stage
    const stage1Keywords = ['hey sparky', 'hello sparky', 'hi sparky'];
    const stage2Keywords = ['faster', 'slower', 'stop', 'dance'];

    // Event listener for speech recognition result
    recognition.onresult = function (event) {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript.toLowerCase();

            if (stage === 1) {
                //console.log('stage1:', transcript);
                for (const keyword of stage1Keywords) {
                    if (transcript.includes(keyword)) {
                        console.log('Entering stage 2...');
                        stage = 2;
                        clearTimeout(timeoutId); // Cancel previous timeout
                        timeoutId = setTimeout(() => {
                            console.log('Timeout: Returning to stage 1');
                            stage = 1;
                        }, 5000); // Timeout after 5 seconds
                        break; // Exit loop after finding a keyword
                    }
                }
            } else if (stage === 2) {
                //console.log('stage2:', transcript);
                for (const keyword of stage2Keywords) {
                    if (transcript.includes(keyword)) {
                        console.log('Keyword detected in stage 2:', keyword);
                        // Fire event to window instance
                        window.dispatchEvent(new CustomEvent('HeySparky', {detail:{ action: keyword }}));
                        console.log('Returning to stage 1...');
                        stage = 1; // Return to stage 1
                        clearTimeout(timeoutId); // Cancel timeout
                        break; // Exit loop after finding a keyword
                    }
                }
            }
        };
    }

    recognition.addEventListener(
        "start",
        (e) => {
            console.log('recognition start.');
        },
        false,
    )   

    recognition.addEventListener(
        "end",
        (e) => {
            if (enableSpeechRecognition) {
                // Start speech recognition
                console.log('recognition end, start again.');
                recognition.start();
            }
        },
        false,
    )   

    recognition.addEventListener('error', e => {
        if (e.error === 'not-allowed') {
            console.log('Speech recognition is not allowed');
            enableSpeechRecognition = false;
        }
    });

    // Start speech recognition
    recognition.start();
}
