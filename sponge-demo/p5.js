// function setup() {
//   createCanvas(400, 400);
// }

// function draw() {
//   background(220);
//   rect(100, 100, 200, 200); // Draws a rectangle (a "box") on the screen
// }

// Classifier Variable
let classifier;
// Model URL
let imageModelURL = "./my_model/";

// Video
let video;
let flippedVideo;
// To store the classification
let label = "";
let ws = new WebSocket("ws://localhost:8080");

// Load the model first
function preload() {
  classifier = ml5.imageClassifier(imageModelURL + "model.json");
}

function setup() {
  createCanvas(320, 260);

  navigator.mediaDevices
    .enumerateDevices()
    .then((devices) => {
      console.log(devices);
      const cameras = devices.filter((device) => device.kind === "videoinput");
      if (cameras.length > 0) {
        // Attempt to find the external camera by name or use the first camera if not found
        let desiredCamera = cameras.find((camera) =>
          camera.label.includes("Anker")
        );
        desiredCamera = desiredCamera || cameras[1];
        // Create capture with the desired camera
        video = createCapture({
          video: { deviceId: desiredCamera.deviceId },
        });
        video.size(640, 480);
        video.hide();
      }
    })
    .catch((err) => console.error("Error accessing media devices:", err));
  // Create the video
  video = createCapture(VIDEO);
  video.size(320, 240);
  video.hide();

  flippedVideo = ml5.flipImage(video);
  // Start classifying
  classifyVideo();
}

function draw() {
  // Draw the video
  background(0);
  image(video, 0, 0, 320, 260);

  // Draw the label
  fill(255);
  textSize(16);
  textAlign(CENTER);
  text(label, width / 2, height - 4);
}

// Get a prediction for the current video frame
function classifyVideo() {
  flippedVideo = ml5.flipImage(video);
  classifier.classify(flippedVideo, gotResult);
  flippedVideo.remove();
}

// When we get a result
function gotResult(error, results) {
  // If there is an error
  if (error) {
    console.error(error);
    return;
  }

  // send video image
  let img = video.get(0, 0, 320, 240);
  // console.log(img);
  ws.send(img.canvas.toDataURL());
  // The results are in an array ordered by confidence.
  // console.log(results[0]);
  label = results[0].label;
  ws.send(label);
  // Classifiy again!
  classifyVideo();
}

classifyVideo();
