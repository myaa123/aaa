const tone = require('tone');

const piano = noteNumber => {
    const synth = new tone.MonoSynth({
        oscillator: {
            type: 'square'
        },
        filter: {
            Q: 2,
            type: 'lowpass',
            rolloff: -12
        },
        envelope: {
            attack: 0.005,
            decay: 3,
            sustain: 0,
            release: 0.45
        },
        filterEnvelope: {
            attack: 0.5,
            decay: 0.32,
            sustain: 0.9,
            release: 3,
            baseFrequency: 700,
            octaves: 2.3
        }
    }).toMaster();
    const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
    // play a note with the synth we setup
    synth.triggerAttackRelease(notes[noteNumber % 8], '16n');
};

module.exports = piano;
