const audioElement = document.querySelector("audio")
const noteNameElement = document.querySelector("span")

function calculateCents(frequencyOne, frequencyTwo) {
  return Math.round(1200 * Math.log2(frequencyTwo / frequencyOne))
}

function startAnalyser(stream) {
  audioElement.srcObject = stream

  const context = new AudioContext()
  const analyser = context.createAnalyser() 
  const noteNames = ["A", "A#/Bb", "B", "C", "C#/Db", "D", "D#/Eb", "E", "F", "F#/Gb", "G", "G#/Ab"]
  const noteFrequencies = [27.5, 29.13524, 30.86771, 32.70320, 34.64783, 36.70810, 38.89087, 41.20344, 43.65353, 46.24930, 48.99943, 51.91309]

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

    const frequency = context.sampleRate / 2 / analyser.frequencyBinCount * maxDecibelIndex
    const keyNumber = Math.round(12 * Math.log2(frequency / 440) + 49)
    const noteIndex = ((keyNumber % noteNames.length) == 0) ? 11 : (keyNumber % noteNames.length) - 1
    const octave = Math.floor(keyNumber / 12)
    const noteName = noteNames[noteIndex]
    const knownFrequency = Math.pow(2, octave) * noteFrequencies[noteIndex]

    const cents = calculateCents(frequency, knownFrequency)
    noteNameElement.textContent = `Note: ${noteName} Cents: ${cents} Frequency: ${frequency} Known: ${knownFrequency}`

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
