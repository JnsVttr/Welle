var gumStream;
//stream from getUserMedia()
var recorder;
//WebAudioRecorder object
var input;
//MediaStreamAudioSourceNode we'll be recording var encodingType;
//holds selected encoding for resulting audio (file)
var encodeAfterRecord = true;
// when to encode
var audioContext = new AudioContext();
//new audio context to help us record
var encodingTypeSelect = document.getElementById("encodingTypeSelect");
var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");

recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
