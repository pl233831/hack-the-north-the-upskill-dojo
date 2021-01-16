const sdk = require("microsoft-cognitiveservices-speech-sdk");
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require('multer');
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'recordings/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
let upload = multer({storage: storage});

const app = express();


app.use(express.static("public"));
app.use(express.json());
app.use(session({ secret: "cats" }));
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.post("/uploadAudio", upload.single('recording'), (req, res) => {
    console.log(req.file.filename);
    res.json({message: "file uploaded"});
});

let port = process.env.PORT;
if (port == null || port == "") {
    port = 5000;
}
// listen for requests :)
const listener = app.listen(port, () => {
    console.log("Your app is listening on port " + listener.address().port);

// recognize text from file

const fs = require('fs');
const sdk = require("microsoft-cognitiveservices-speech-sdk");
const speechConfig = sdk.SpeechConfig.fromSubscription("0deae8e94a7c439691289f32093d2c67", "canadacentral");

function fromFile() {
    let pushStream = sdk.AudioInputStream.createPushStream();

    fs.createReadStream("recordings/test-recording.wav").on('data', function(arrayBuffer) {
        pushStream.write(arrayBuffer.slice());
    }).on('end', function() {
        pushStream.close();
    });

    let audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
    let recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
    recognizer.recognizeOnceAsync(result => {
        switch (result.reason) {
    case ResultReason.RecognizedSpeech:
        console.log(`RECOGNIZED: Text=${result.text}`);
        break;
    case ResultReason.NoMatch:
        console.log("NOMATCH: Speech could not be recognized.");
        break;
    case ResultReason.Canceled:
        const cancellation = CancellationDetails.fromResult(result);
        console.log(`CANCELED: Reason=${cancellation.reason}`);

        if (cancellation.reason == CancellationReason.Error) {
            console.log(`CANCELED: ErrorCode=${cancellation.ErrorCode}`);
            console.log(`CANCELED: ErrorDetails=${cancellation.errorDetails}`);
            console.log("CANCELED: Did you update the subscription info?");
        }
        break;
    }
        recognizer.close();
    });
}
fromFile();



});
