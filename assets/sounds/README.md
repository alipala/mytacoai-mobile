# Sound Files for MyTaco AI

This directory contains audio feedback files for an immersive gaming experience.

## Current Status

⚠️ **Placeholder files are currently in place** - The MP3 files in this directory are minimal silent placeholders created to allow Metro Bundler to build successfully. **Replace these with actual sound files** from your collection at:
`/Users/alipala/github/MyTacoAIMobile/assets/sounds/`

To replace the placeholders:
1. Copy your actual MP3 files to this directory
2. Restart Metro bundler with: `npx react-native start --reset-cache`
3. Restart the app

## Required Sound Files (MP3 format)

Add the following MP3 files to this directory:

1. **correct.mp3** - Success/correct answer sound (happy, uplifting)
2. **wrong.mp3** - Error/wrong answer sound (gentle error tone)
3. **timeout.mp3** - Time's up sound (urgent beep)
4. **tick.mp3** - Countdown tick sound (clock tick)
5. **complete.mp3** - Challenge completion sound (achievement fanfare)
6. **tap.mp3** - Button tap sound (subtle tap feedback)
7. **swoosh.mp3** - Page transition sound (smooth whoosh)
8. **confetti.mp3** - Celebration sound (party/confetti)

## Sound File Guidelines

- **Format**: MP3
- **Duration**: 0.5 - 2 seconds (short and snappy)
- **Quality**: 128kbps or higher
- **Volume**: Normalized to -3dB to -6dB

## Free Sound Resources

You can find free game sound effects at:
- [Freesound.org](https://freesound.org/)
- [Zapsplat](https://www.zapsplat.com/)
- [Mixkit](https://mixkit.co/free-sound-effects/)
- [Pixabay Sounds](https://pixabay.com/sound-effects/)

## Usage

The sound service will automatically load these files and play them when:
- User selects an answer (correct/wrong)
- Time runs out (timeout)
- Countdown is active (tick)
- Challenge is completed (complete)
- User taps buttons (tap)
- Screen transitions (swoosh)
- All challenges completed (confetti)

If a sound file is missing, the app will silently skip that sound effect.
