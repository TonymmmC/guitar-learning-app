import * as Tone from 'tone'

export function testWebAudio() {
    //TypeScript deberia reconocer AudioContext sin tipos adicionales
    const audioContext = new (window.AudioContext || (window as any). webkitAudioContext)()
    return audioContext
}

export function testToneJS() {
    // Probamos Tone.js
    const synth = new Tone.Synth().toDestination()
    return synth
}

export function testAudioDetection() {
    // Configuracion basica para deteccion de audio
    return navigator.mediaDevices?.getUserMedia({ audio: true})
}