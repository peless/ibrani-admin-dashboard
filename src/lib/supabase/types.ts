// types.ts (Updated for Date types and consistent enum usage)
import { Difficulty, LevelResult } from "@/types/levels";
import {
  AssessmentStatus,
  AiParameterType,
  ScoreParameterType,
  ErrorCategoryType,
  ErrorSeverity,
  CefrLevelType,
} from "./enums";

export interface Assessment {
  id: string; // uuid
  session_id: string; // uuid (after migration)
  created_at: Date;
  updated_at: Date;
  status: AssessmentStatus;
  user_agent: string | null;
  ip_address: string | null; // inet
  audio_file_path: string | null;
  audio_duration_seconds: number | null; // numeric(8,3)
  audio_file_size_bytes: number | null;
  transcript: string | null;
  transcription_service: string;
  transcription_confidence: number | null; // numeric(4,3)
  transcription_language_detected: string | null;
  prompt_id: number; // uuid[]
  prompt: string;
  processing_started_at: Date | null;
  processing_completed_at: Date | null;
  total_processing_seconds: number | null;
  prompt_language: string | null; // char(2)
  prompt_concept_ids: string[] | null; // uuid[]
  question_sequence: number | null;
  difficulty_level: string | null; // varchar(50)
  session_status: string | null; // varchar(50) - consider making this an enum if fixed values
}

export interface AiDetection {
  id: string; // uuid
  assessment_id: string | null; // uuid
  parameter_type: AiParameterType;
  model_used: string;
  model_version: string | null;
  prompt_version_hash: string;
  detection_data: Record<string, unknown>; // jsonb
  raw_api_response: Record<string, unknown> | null; // jsonb
  confidence_score: number | null; // numeric(4,3)
  processing_time_ms: number | null;
  token_usage: number | null;
  detected_at: Date;
}

export interface AssessmentMetric {
  assessment_id: string; // uuid
  total_words: number;
  unique_words: number;
  words_per_minute: number; // numeric(6,2)
  pause_count: number;
  total_pause_duration_seconds: number; // numeric(8,3)
  pauses_per_minute: number; // numeric(6,2)
  speech_duration_seconds: number; // numeric(8,3)
  speech_to_total_ratio: number; // numeric(4,3)
  calculated_at: Date;
}

export interface AssessmentResult {
  assessment_id: string; // uuid
  overall_raw_score: number; // numeric(5,2)
  overall_cefr_level: CefrLevelType;
  parameter_weights: Record<string, number>; // jsonb
  calculation_details: Record<string, unknown>; // jsonb
  strengths_identified: Record<string, unknown> | null; // jsonb
  improvement_priorities: Record<string, unknown> | null; // jsonb
  next_level_requirements: string | null;
  algorithm_version: string;
  scoring_completed_at: Date;
  manual_review_required: boolean | null;
  manual_review_notes: string | null;
  manual_reviewer: string | null;
}

export interface DetectedError {
  id: string; // uuid
  assessment_id: string | null; // uuid
  ai_detection_id: string | null; // uuid
  error_category: ErrorCategoryType;
  error_type: string;
  severity: ErrorSeverity | null;
  error_location_start: number | null;
  error_location_end: number | null;
  sentence_number: number | null;
  original_text: string;
  suggested_correction: string | null;
  explanation: string | null;
  frequency_in_assessment: number | null;
  created_at: Date;
}

export interface GptPrompt {
  version_hash: string;
  parameter_type: AiParameterType;
  prompt_content: string;
  prompt_description: string | null;
  average_response_time_ms: number | null;
  success_rate: number | null; // numeric(4,3)
  average_token_usage: number | null;
  created_at: Date;
  created_by: string;
  is_active: boolean | null;
}

export interface ParameterScore {
  id: string; // uuid
  assessment_id: string | null; // uuid
  parameter_type: ScoreParameterType;
  raw_score: number; // numeric(5,2)
  cefr_level: CefrLevelType;
  weight_percentage: number; // numeric(4,2)
  calculation_method: string;
  lookup_table_used: string | null;
  input_values: Record<string, unknown>; // jsonb
  evidence_summary: string | null;
  algorithm_version: string;
  calculated_at: Date;
}

export interface ScoringAlgorithm {
  version: string;
  description: string;
  parameter_weights: Record<string, number>; // jsonb
  lookup_tables: Record<string, unknown>; // jsonb
  cefr_thresholds: Record<string, number>; // jsonb
  validation_results: Record<string, unknown> | null; // jsonb
  human_correlation_score: number | null; // numeric(4,3)
  created_by: string;
  active_from: Date;
  active_until: Date | null;
  is_current: boolean | null;
  previous_version: string | null;
  change_rationale: string | null;
}

// Updated V3Session to use AssessmentStatus and Date for datetime fields
export type V3Session = {
  user_test_code: string; 
  session_id: string; // uuid from migration
  created_at: Date | null;
  total_questions: number | null;
  completed_questions: number | null;
  failed_questions: number | null;
  processing_questions: number | null;
  status: AssessmentStatus | null; // Using AssessmentStatus for consistency
  last_activity: Date | null;
  can_aggregate: boolean | null;
  cefr_display_hidden:boolean |null;
};

export interface UserQuestion {
  id: number; // bigint
  created_at: Date;
  updated_ay: Date | null;
  level: CefrLevelType;
  prompt_ar: string;
  prompt_he: string;
  prompt_en: string;
}

// Interface for system_errors (if you implement it as per the migration script's note)
export interface SystemError {
  id: string; // uuid
  assessment_id: string | null; // uuid
  error_type: string;
  error_message: string | null;
  component: string | null;
  severity: string | null;
  request_data: Record<string, unknown> | null; // jsonb
  occurred_at: Date;
}

export interface SessionResult {
  // ISO timestamp format
  session_id: string; // uuid
  prompts: { [x: string]: string };
  transcripts: string[];
  audio_durations: number[];
  word_counts: number[];
  unique_words: number[];
  pause_counts: number[];
  language_detected: string[];
  improvement_tip: {
    en?: string;
    ar?: string;
    he?: string;
  } | null;
  audio_links: {
    [x: string]: string;
  } | null;

  grammar_morphology_raw_score: number;
  grammar_morphology_cerf_score: string;
  vocabulary_sophistication_raw_score: number;
  vocabulary_sophistication_cerf_score: string;
  syntax_word_order_raw_score: number;
  syntax_word_order_cerf_score: string;
  task_completion_raw_score: number;
  task_completion_cerf_score: string;
  overall_proficiency_raw_score?: number;
  overall_proficiency_cerf_score?: string;
  fluency_coherence_raw_score: number;
  fluency_coherence_cerf_score: string;
  pause_patterns_raw_score: number;
  pause_patterns_cerf_score: string;
  final_score_raw_score: number;
  final_score_cerf_score: string;
}

export interface ProcessedResponse {
  success: boolean;
  description: string;
  next_level: Difficulty;
  assessments: Record<Difficulty, Partial<LevelResult>>;
}
