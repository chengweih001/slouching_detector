function Speak(content) {
    /*let utterance = new SpeechSynthesisUtterance(content);
    speechSynthesis.speak(utterance);*/
    let file;
    if (content === 'hi') {
        console.log('Say "Hi, I am Sparky!"');
        file = 'resource/hi-i-am-sparky.mp3'
    } else if (content === 'stage1') {
        console.log('Say "Hey, I notice you are slouching"');
        file = 'resource/hey-i-notice-you-are-slouching.mp3';
    } else if (content === 'stage2') {
        console.log('Say "Hmph, please sit up straight"');
        file = 'resource/hmph-please-sit-up-straight.mp3';
    } else if (content === 'stage3') {
        console.log('Say "Maybe it\'s time for a break"');
        file = 'resource/maybe-its-time-for-a-break.mp3';
    } else if (content === 'robotDance') {
        console.log('Say "Okay, are you ready? Now let\'s dance!"');
        file = 'resource/okay-are-you-ready-now-lets-dance.mp3';
    } else if (content === 'oops') {
        console.log('Say "Oops"');
        file = 'resource/oops.mp3';
    } else if (content === 'awesome') {
        console.log('Say "Awesome"');
        file = 'resource/awesome.mp3';
    } else if (content === 'dance-score-high') {
        file = 'resource/dance-score-high.mp3';
    } else if (content === 'dance-score-mid') {
        file = 'resource/dance-score-mid.mp3';
    } else if (content === 'dance-score-low') {
        file = 'resource/dance-score-low.mp3';
    } else {
        // Can't find any match voice, early return here.
        console.error(`Speak: Can't find match voice for ${content}`);
        return;
    }
    // More human voice.
    const audioElement = document.getElementById('speech');
    const source = audioElement.querySelector('source');
    source.src = file;
    audioElement.load();
    audioElement.play();
}
