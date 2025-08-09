import { parameterWeights } from "@/constants";
import { CefrLevelType } from "@/services/supabase/enums";
import { SessionResult } from "@/services/supabase/types";
import { Difficulty, LevelResult } from "@/types/levels";
import { object } from "zod";

export function getScoreCEFRLevel(score: number): CefrLevelType {
  if (score < 0 || score > 100) {
    throw new Error("Score must be between 0 and 100");
  }

  if (score < 45) return CefrLevelType.A1_1;
  if (score < 50) return CefrLevelType.A1_2;
  if (score < 55) return CefrLevelType.A2_1;
  if (score < 60) return CefrLevelType.A2_2;
  if (score < 65) return CefrLevelType.B1_1;
  if (score < 70) return CefrLevelType.B1_2;
  if (score < 75) return CefrLevelType.B2_1;
  if (score < 80) return CefrLevelType.B2_2;
  if (score < 90) return CefrLevelType.C1;
  return CefrLevelType.C2;
}
export enum AiParameterType {
  GrammarMorphology = "grammar_morphology",
  VocabularySophistication = "vocabulary_sophistication",
  SyntaxWordOrder = "syntax_word_order",
  TaskCompletion = "task_completion",
  OverallProficiency = "overall_proficiency", // Represents 'overall_assessment'
  FluencyCoherence = "fluency_coherence",
  PausePatterns = "pause_patterns",
}

type EvaluationInputs = {
  [AiParameterType.GrammarMorphology]: number;
  [AiParameterType.VocabularySophistication]: number;
  [AiParameterType.FluencyCoherence]: number;
  [AiParameterType.SyntaxWordOrder]: number;
  [AiParameterType.PausePatterns]: number;
  [AiParameterType.TaskCompletion]: number;
};

// Updated WeightedScores to include CEFR levels
export type WeightedScores = {
  final_score: number;
  final_score_cefr_level: string; // CEFR for the overall final score
  weighted_components: {
    [AiParameterType.GrammarMorphology]: number;
    [AiParameterType.VocabularySophistication]: number;
    [AiParameterType.FluencyCoherence]: number;
    [AiParameterType.SyntaxWordOrder]: number;
    [AiParameterType.PausePatterns]: number;
    [AiParameterType.TaskCompletion]: number;
  };
  raw_score_cefr_levels: {
    // CEFR for each raw input score
    [AiParameterType.GrammarMorphology]: string;
    [AiParameterType.VocabularySophistication]: string;
    [AiParameterType.FluencyCoherence]: string;
    [AiParameterType.SyntaxWordOrder]: string;
    [AiParameterType.PausePatterns]: string;
    [AiParameterType.TaskCompletion]: string;
  };
};

export function calculateOverallScore(input: EvaluationInputs): WeightedScores {
  const weighted_components: WeightedScores["weighted_components"] = {
    [AiParameterType.GrammarMorphology]:
      input[AiParameterType.GrammarMorphology] *
      (parameterWeights[AiParameterType.GrammarMorphology] / 100),
    [AiParameterType.VocabularySophistication]:
      input[AiParameterType.VocabularySophistication] *
      (parameterWeights[AiParameterType.VocabularySophistication] / 100),
    [AiParameterType.FluencyCoherence]:
      input[AiParameterType.FluencyCoherence] *
      (parameterWeights[AiParameterType.FluencyCoherence] / 100),
    [AiParameterType.SyntaxWordOrder]:
      input[AiParameterType.SyntaxWordOrder] *
      (parameterWeights[AiParameterType.SyntaxWordOrder] / 100),
    [AiParameterType.PausePatterns]:
      input[AiParameterType.PausePatterns] *
      (parameterWeights[AiParameterType.PausePatterns] / 100),
    [AiParameterType.TaskCompletion]:
      input[AiParameterType.TaskCompletion] *
      (parameterWeights[AiParameterType.TaskCompletion] / 100),
  };

  const final_score_sum = Object.values(weighted_components)
    .filter((score) => score !== undefined)
    .reduce((sum, score) => sum + score, 0);

  const finalScoreRounded = Math.round(final_score_sum);

  // Calculate CEFR levels for raw input scores
  const raw_score_cefr_levels: WeightedScores["raw_score_cefr_levels"] = {
    [AiParameterType.GrammarMorphology]: getScoreCEFRLevel(
      input[AiParameterType.GrammarMorphology]
    ),
    [AiParameterType.VocabularySophistication]: getScoreCEFRLevel(
      input[AiParameterType.VocabularySophistication]
    ),
    [AiParameterType.FluencyCoherence]: getScoreCEFRLevel(
      input[AiParameterType.FluencyCoherence]
    ),
    [AiParameterType.SyntaxWordOrder]: getScoreCEFRLevel(
      input[AiParameterType.SyntaxWordOrder]
    ),
    [AiParameterType.PausePatterns]: getScoreCEFRLevel(
      input[AiParameterType.PausePatterns]
    ),
    [AiParameterType.TaskCompletion]: getScoreCEFRLevel(
      input[AiParameterType.TaskCompletion]
    ),
  };

  return {
    final_score: finalScoreRounded,
    final_score_cefr_level: getScoreCEFRLevel(finalScoreRounded), // CEFR for the rounded final score
    weighted_components,
    raw_score_cefr_levels, // Adding CEFR levels for raw scores to the output
  };
}

type SpecificScoreDetails = {
  weighted_score: number;
  raw_score_cefr_level: string;
};

export function getWeightedScoreAndCefr(
  key: AiParameterType,
  rawScore: number
): SpecificScoreDetails {
  // Define the weights, prioritizing environment variables with the specified default percentages
  // These weights must match those used in calculateOverallScore for consistency.


  // Get the specific weight for the provided key
  const specificWeight = parameterWeights[key as keyof typeof parameterWeights];

  // Check if the key exists in our weights to prevent errors
  if (specificWeight === undefined) {
    console.error(`Error: No weight defined for AiParameterType: ${key}`);
    // You might want to throw an error or return a default/error object here
    return {
      weighted_score: 0,
      raw_score_cefr_level: "N/A",
    };
  }

  // Calculate the weighted score
  const weightedScore = rawScore * (specificWeight / 100);

  // Calculate CEFR levels

  return {
    weighted_score: weightedScore,
    raw_score_cefr_level: getScoreCEFRLevel(rawScore),
  };
}

export const session_from_asssessment = (
  assessment: {
    [key in Difficulty]: Partial<LevelResult>;
  },
  improvement_tip: any,
  session_id: string
): SessionResult => {
  const ass = Object.entries(assessment);

  const prompts = ass.reduce((acc, [level, result]) => {
    acc[level] = result?.prompt ?? "";
    return acc;
  }, {} as { [key in string]: string });

  const transcripts = ass
    .map(([level, result]) => result?.result?.text)
    .filter((result) => result !== undefined);

  const audio_durations = ass
    .map(([level, result]) => result?.result?.speaking_duration)
    .filter((result) => result !== undefined);
  const word_counts = ass
    .map(([level, result]) => result?.result?.total_words)
    .filter((result) => result !== undefined);
  const unique_words = ass
    .map(([level, result]) => result?.result?.unique_words)
    .filter((result) => result !== undefined);
  const pause_counts = ass
    .map(([level, result]) => result?.result?.pause_count)
    .filter((result) => result !== undefined);
  const language_detected = ass
    .map(([level, result]) => result?.result?.language)
    .filter((result) => result !== undefined);
  const audio_links = ass.reduce((acc, [level, result]) => {
    acc[level] = result?.audio_file_path ?? "";
    return acc;
  }, {} as { [key in string]: string });

  const grammar_morphology_raw_score = Math.round(
    ass.reduce((acc, [level, result]) => {
      const num =
        acc + (result?.evaluationResult?.grammar_morphology?.raw_score ?? 0);
      return num;
    }, 0) / 4
  );

  const vocabulary_sophistication_raw_score = Math.round(
    ass.reduce((acc, [level, result]) => {
      const num =
        acc +
        (result?.evaluationResult?.vocabulary_sophistication?.raw_score ?? 0);
      return num;
    }, 0) / 4
  );
  const syntax_word_order_raw_score = Math.round(
    ass.reduce((acc, [level, result]) => {
      const num =
        acc + (result?.evaluationResult?.syntax_word_order?.raw_score ?? 0);
      return num;
    }, 0) / 4
  );
  const task_completion_raw_score = Math.round(
    ass.reduce((acc, [level, result]) => {
      const num =
        acc + (result?.evaluationResult?.task_completion?.raw_score ?? 0);
      return num;
    }, 0) / 4
  );
  const fluency_coherence_raw_score = Math.round(
    ass.reduce((acc, [level, result]) => {
      const num =
        acc + (result?.evaluationResult?.fluency_speaking_rate?.raw_score ?? 0);
      return num;
    }, 0) / 4
  );
  const pause_patterns_raw_score = Math.round(
    ass.reduce((acc, [level, result]) => {
      const num =
        acc + (result?.evaluationResult?.pause_patterns?.raw_score ?? 0);
      return num;
    }, 0) / 4
  );
  const final_score_raw_score = Math.round(
    ass.reduce((acc, [level, result]) => {
      const num = acc + (result?.overall_score?.final_score ?? 0);
      return num;
    }, 0) / 4
  );

  const grammar_morphology_cerf_score = getScoreCEFRLevel(
    grammar_morphology_raw_score
  );
  const vocabulary_sophistication_cerf_score = getScoreCEFRLevel(
    vocabulary_sophistication_raw_score
  );
  const syntax_word_order_cerf_score = getScoreCEFRLevel(
    syntax_word_order_raw_score
  );
  const task_completion_cerf_score = getScoreCEFRLevel(
    task_completion_raw_score
  );
  const fluency_coherence_cerf_score = getScoreCEFRLevel(
    fluency_coherence_raw_score
  );
  const pause_patterns_cerf_score = getScoreCEFRLevel(pause_patterns_raw_score);

  const final_score_cerf_score = getScoreCEFRLevel(final_score_raw_score);

  return {
    session_id,
    prompts,
    transcripts,
    improvement_tip,
    audio_durations,
    word_counts,
    unique_words,
    pause_counts,
    audio_links,
    language_detected,
    grammar_morphology_raw_score,
    grammar_morphology_cerf_score,
    vocabulary_sophistication_raw_score,
    vocabulary_sophistication_cerf_score,
    syntax_word_order_raw_score,
    syntax_word_order_cerf_score,
    task_completion_raw_score,
    task_completion_cerf_score,
    fluency_coherence_raw_score,
    fluency_coherence_cerf_score,
    pause_patterns_raw_score,
    pause_patterns_cerf_score,
    final_score_raw_score,
    final_score_cerf_score,
  };
};
