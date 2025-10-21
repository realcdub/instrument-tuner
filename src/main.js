const audioElement = document.querySelector("audio")
const noteNameElement = document.querySelector("span")

function startAnalyser(stream) {
  audioElement.srcObject = stream

  const context = new AudioContext()
  const analyser = context.createAnalyser() 
  const noteNames = ["A", "A#/Bb", "B", "C", "C#/Db", "D", "D#/Eb", "E", "F", "F#/Gb", "G", "G#/Ab"]

  let source = context.createMediaStreamSource(stream)
  source.connect(analyser)

  setInterval(() => {
    const frequencyData = new Float32Array(analyser.frequencyBinCount)
    analyser.getFloatFrequencyData(frequencyData)

    let maxDecibelIndex = 0
    for (let i = 1; i < analyser.frequencyBinCount; ++i) {
      if (frequencyData[i] > frequencyData[maxDecibelIndex]) {
        maxDecibelIndex = i
      }
    }

    const frequency = ((context.sampleRate / 2) / analyser.frequencyBinCount) * (maxDecibelIndex + 1)
    const keyNumber = Math.floor(12 * Math.log2(frequency / 440) + 49)
    const noteName = noteNames[((keyNumber % noteNames.length) == 0) ? 11 : (keyNumber % noteNames.length) - 1]
    noteNameElement.textContent = `Note: ${noteName}`

  }, 500)
}

function getLocalStream() {
  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
      startAnalyser(stream)
    })
    .catch((err) => {
      console.error(`you got an error: ${err}`);
    });
}

getLocalStream()
