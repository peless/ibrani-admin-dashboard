// enums.ts (No changes needed, already good)
export enum AssessmentStatus {
    InProgress = 'in_progress',
    Processing = 'processing',
    Completed = 'completed',
    Failed = 'failed',
    Cancelled = 'cancelled',
}

export enum V3SessionStatus {
    InProgress = "in_progress",
    ReadyForAggregation = "ready_for_aggregation",
    Completed = "completed",
    Failed = "failed"
}

export enum AiParameterType {
    GrammarMorphology = 'grammar_morphology',
    VocabularySophistication = 'vocabulary_sophistication',
    SyntaxWordOrder = 'syntax_word_order',
    TaskCompletion = 'task_completion',
    OverallProficiency = 'overall_proficiency',
    FluencyCoherence = 'fluency_coherence',
    PausePatterns = 'pause_patterns',
}

export enum ScoreParameterType {
    GrammarMorphology = 'grammar_morphology',
    VocabularySophistication = 'vocabulary_sophistication',
    SyntaxWordOrder = 'syntax_word_order',
    TaskCompletion = 'task_completion',
    FluencyWPM = 'fluency_wpm',
    PausePatterns = 'pause_patterns',
    GptOverall = 'gpt_overall',
    FluencySpeakingRate = 'fluency_speaking_rate',
    OverallAssessment = 'overall_assessment',
}

export enum ErrorCategoryType {
    Grammar = 'grammar',
    Vocabulary = 'vocabulary',
    Syntax = 'syntax',
    Pronunciation = 'pronunciation',
    Pragmatic = 'pragmatic',
}

export enum ErrorSeverity {
    Low = 'low',
    Medium = 'medium',
    High = 'high',
    Critical = 'critical',
}

export enum CefrLevelType {
    A1_1 = 'A1.1',
    A1_2 = 'A1.2',
    A2_1 = 'A2.1',
    A2_2 = 'A2.2',
    B1_1 = 'B1.1',
    B1_2 = 'B1.2',
    B2_1 = 'B2.1',
    B2_2 = 'B2.2',
    C1 = 'C1',
    C2 = 'C2',
    A1 = 'A1',
    A1_Plus = 'A1+',
    A2 = 'A2',
    A2_Plus = 'A2+',
    B1 = 'B1',
    B1_Plus = 'B1+',
    B2 = 'B2',
    B2_Plus = 'B2+',
}