/**
 * Web Speech API helper for hands-free step reading for Mom
 */

let speechUtterance: SpeechSynthesisUtterance | null = null;
let isVoiceEnabled = true;

export function setVoiceEnabled(enabled: boolean) {
  isVoiceEnabled = enabled;
  if (!enabled) {
    stopSpeaking();
  }
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function speakStep(text: string, onEnd?: () => void) {
  if (!isVoiceEnabled || !isSpeechSupported()) return;

  stopSpeaking();

  // Clean text from timer tags or excessive punctuation
  const cleanText = text.replace(/\[Start \d+ min timer\]/gi, '').trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 0.95; // slightly slower, clear and soothing
  utterance.pitch = 1.05;

  // Attempt to select an Indian English or standard warm English voice
  const voices = window.speechSynthesis.getVoices();
  const indianVoice = voices.find((v) => v.lang.includes('en-IN') || v.name.includes('India'));
  const naturalVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));

  if (indianVoice) {
    utterance.voice = indianVoice;
  } else if (naturalVoice) {
    utterance.voice = naturalVoice;
  }

  if (onEnd) {
    utterance.onend = () => onEnd();
  }

  speechUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}
