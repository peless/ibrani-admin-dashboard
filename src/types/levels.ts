import { HolisticAnalysis } from "@/schema/stream-object";
import { WeightedScores } from "@/utils";
import { TranscriptMetadata } from "@/utils/calculateTranscriptMetadata";

export enum Level {
  A1_1 = "A1.1",
  A1_2 = "A1.2",
  A2_1 = "A2.1",
  A2_2 = "A2.2",
  B1_1 = "B1.1",
  B1_2 = "B1.2",
  B2_1 = "B2.1",
  B2_2 = "B2.2",
  C1_1 = "C1.1",
  C1_2 = "C1.2",
  C2_1 = "C2.1",
  C2_2 = "C2.2",
}
export enum Difficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
  DIFFICULT = "difficult",
}

interface GrammarError {
  type: string;
  original: string;
  corrected: string;
  explanation: string;
  severity: string;
  location_start: number;
  location_end: number;
  confidence: number;
}

interface GrammarMorphology {
  raw_score: number;
  error_count: number;
  confidence: number;
  errors: GrammarError[];
  analysis_note: string;
}

interface SyntaxError {
  type: string;
  original: string;
  corrected: string;
  explanation: string;
  severity: string;
  location_start: number;
  location_end: number;
}

interface SyntaxWordOrder {
  raw_score: number;
  errors: SyntaxError[];
  total_errors_found: number;
  confidence_score: number;
}


interface VocabularySophistication {
  raw_score: number;
  justification: string;
}

interface TaskCompletion {
  raw_score: number;
  prompt_elements: string[];
  matched_elements: string[];
  missing_elements: string[];
  coverage_ratio: number;
  confidence_score: number;
  analysis_note: string;
}

interface OverallAssessment {
  raw_score: number;
  justification: string;
  confidence: number;
}

interface FluencySpeakingRate {
  raw_score: number;
  wpm: number;
}

interface PausePatterns {
  raw_score: number;
  ppm: number;
}

interface EvaluationResult {
  grammar_morphology: GrammarMorphology;
  syntax_word_order: SyntaxWordOrder;
  vocabulary_sophistication: VocabularySophistication;
  task_completion: TaskCompletion;
  overall_assessment: OverallAssessment;
  fluency_speaking_rate: FluencySpeakingRate;
  pause_patterns: PausePatterns;
}

export interface LevelResult {
  audio_file_path: string; // in seconds
  level: Difficulty;
  assessment_id: string; // uuid
  result: TranscriptMetadata;
  evaluationResult: EvaluationResult;
  holistic_analysis: HolisticAnalysis;
  overall_score: WeightedScores;
  prompt: string;
}
