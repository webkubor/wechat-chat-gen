import { playClickSound, playSuccessSound, playErrorSound, playWaterSound } from '../utils/sound'

let audioContext: AudioContext | null = null

const initAudio = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }
}

export const initAudioOnClick = () => {
  const handleFirstClick = () => {
    initAudio()
    document.removeEventListener('click', handleFirstClick)
    document.removeEventListener('touchstart', handleFirstClick)
  }

  document.addEventListener('click', handleFirstClick)
  document.addEventListener('touchstart', handleFirstClick)
}

export const useSound = () => {
  const playClick = () => {
    initAudio()
    playClickSound()
  }

  const playSuccess = () => {
    initAudio()
    playSuccessSound()
  }

  const playError = () => {
    initAudio()
    playErrorSound()
  }

  const playWater = () => {
    initAudio()
    playWaterSound()
  }

  return {
    playClick,
    playSuccess,
    playError,
    playWater
  }
}
