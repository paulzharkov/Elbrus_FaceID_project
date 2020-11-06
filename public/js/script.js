const video = document.getElementById('video')

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models') 
]).then(start)

async function start() {
  await recognizeFaces()
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

async function recognizeFaces() {
  const labeledDescriptors = await loadLabeledImages()
  const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.7)
  video.addEventListener('play', async () => {
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)

    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors()
      const resizedDetections = faceapi.resizeResults(detections, displaySize)
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
      const results = resizedDetections.map((d) => {
        return faceMatcher.findBestMatch(d.descriptor)
      })
      results.forEach((result, i) => {
        const box = resizedDetections[i].detection.box
        const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
        const names = ['Paul', 'Vitya', 'Dima', 'Igor', 'Ilona', 'Masha', 'Taras'] 
        for (let i = 0; i < names.length; i++) {
          const name = names[i];
          if (result.label == name) {
            const button = document.getElementById('button')
            button.innerHTML = `Welcome, ${name}`;
          }
        }
        drawBox.draw(canvas)
      })
    }, 100)
  })
}


function loadLabeledImages() {
  const labels = ['Paul', 'Vitya', 'Dima', 'Igor', 'Ilona', 'Masha', 'Taras'] // for WebCam
  return Promise.all(
    labels.map(async (label) => {
      const descriptions = []
      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(`../labeled_images/${label}/${i}.jpg`)
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        console.log(label + i + JSON.stringify(detections))
        descriptions.push(detections.descriptor)
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}
