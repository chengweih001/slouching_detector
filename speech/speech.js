function Speak(content) {
    let utterance = new SpeechSynthesisUtterance(content);
    speechSynthesis.speak(utterance);
}