export interface TranscriptMetadata {
  text: string;
  total_words: number;
  unique_words: number;
  speaking_duration: number;
  pause_count: number;
  language: string;
  words_per_minute?: number;
  pauses_per_minute?: number;
}