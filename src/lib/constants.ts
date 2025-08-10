import { Difficulty } from "@/types/levels";
import { AiParameterType } from "@/lib/calculations";
export const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV == "production";
export const API_URL =
  "https://hebrewspeakingevaluation--hebrew-asr-service-web-api.modal.run";
export const grammer_prompt = process.env.OPENAI_PROMPT_GRAMMER_PROMPT ?? "You are a Hebrew language expert. Analyze the following Hebrew text for grammar and morphology errors.\n\nCRITICAL INSTRUCTIONS:\n- ONLY report errors if you are 100% confident they exist\n- If the original text is grammatically correct, return an empty error list\n- Do NOT create corrections that are identical to the original text\n- Focus on clear, objective errors only\n- Minimum confidence threshold: 0.9\nFocus on finding specific errors, not scoring."
export const vocabulary_prompt = `Hebrew vocabulary assessment - Rate 35-100.

This appears to be native/near-native Hebrew based on natural flow. Consider:
- Natural Hebrew expressions and idioms
- Conversational fluency markers
- Word variety and complexity
- Contextual appropriateness

Score accurately - native Hebrew should score 80-95. Intermediate should be 60-79.

Evaluate this Hebrew text:`
export const syntax_prompt = process.env.OPENAI_PROMPT_SYNTAX_PROMPT ?? "You are a Hebrew syntax evaluator. Analyze this text and count major sentence structure violations (e.g. word order, clauses)."
export const task_completion_prompt = process.env.OPENAI_PROMPT_TASK_COMPLETION_PROMPT ?? "You are a CEFR-aligned evaluator. Given the prompt and student response, assess which required elements are covered"
export const holistic_assessment_prompt = process.env.OPENAI_PROMPT_HOLISTIC_ASSESSMENT ?? `You are a CEFR-aligned language evaluator AI.
Given the following scoring data across multiple dimensions, analyze and return:
- Key strengths identified (per category)
- Top priorities for improvement (per category)
- A clear description of what the student must do to reach the next CEFR level
- Indicate if manual review is required for any errors or inconsistencies`
export const final_cerf_evaluation_prompt = process.env.OPENAI_PROMPT_FINAL_PROMPT ??
  "You are a professional hebrew speaking examiner. Score responses using the CEFR scale from A1.1 to C2. Analyze the transcript based on: (1) grammar accuracy (errors per 100 words), (2) vocabulary range (unique ÷ total words), (3) speech rate (WPM), (4) pauses longer than 2 sec per minute, and (5) task completion. Return a structured JSON with these fields only: 'cefr' (e.g. 'B1.2'), 'grammar_errors', 'vocab_range', 'speech_rate', 'pauses', 'task_completion' (true/false), 'brief_feedback', and 'indicators' (fluency/vocab/completeness: green/yellow/red). Respond only in JSON."
export const gptModel = process.env.GPT_MODEL ?? "gpt-4o";
export const LEVEL_MAPPING = {
  [Difficulty.EASY]: {
    id: 1,
    level: process.env.NEXT_PUBLIC_LEVEL_EASY?.split(",") ?? ["A1.1"],
    minimumSeconds: Number(process.env.NEXT_PUBLIC_MIN_SECONDS_EASY) || 30,
    recommendedSeconds:
      Number(process.env.NEXT_PUBLIC_RECOMMENDED_SECONDS_EASY) || 30,
  },
  [Difficulty.MEDIUM]: {
    id: 2,
    level: process.env.NEXT_PUBLIC_LEVEL_MEDIUM?.split(",") ?? ["A1.1"],
    minimumSeconds: Number(process.env.NEXT_PUBLIC_MIN_SECONDS_MEDIUM) || 30,
    recommendedSeconds:
      Number(process.env.NEXT_PUBLIC_RECOMMENDED_SECONDS_MEDIUM) || 30,
  },
  [Difficulty.HARD]: {
    id: 3,
    level: process.env.NEXT_PUBLIC_LEVEL_HARD?.split(",") ?? ["A1.1"],
    minimumSeconds: Number(process.env.NEXT_PUBLIC_MIN_SECONDS_HARD) || 30,
    recommendedSeconds:
      Number(process.env.NEXT_PUBLIC_RECOMMENDED_SECONDS_HARD) || 30,
  },
  [Difficulty.DIFFICULT]: {
    id: 4,
    level: process.env.NEXT_PUBLIC_LEVEL_DIFFICULT?.split(",") ?? ["A1.1"],
    minimumSeconds: Number(process.env.NEXT_PUBLIC_MIN_SECONDS_DIFFICULT) || 30,
    recommendedSeconds:
      Number(process.env.NEXT_PUBLIC_RECOMMENDED_SECONDS_DIFFICULT) || 30,
  },
};
export const parameterWeights = {
  [AiParameterType.GrammarMorphology]: Number(
    process.env.NEXT_PUBLIC_GRAMMAR_MORPHOLOGY_WEIGHT ?? 23
  ),
  [AiParameterType.VocabularySophistication]: Number(
    process.env.NEXT_PUBLIC_VOCABULARY_SOPHISTICATION_WEIGHT ?? 21
  ),
  [AiParameterType.FluencyCoherence]: Number(
    process.env.NEXT_PUBLIC_FLUENCY_COHERENCE_WEIGHT ?? 17
  ),
  [AiParameterType.SyntaxWordOrder]: Number(
    process.env.NEXT_PUBLIC_SYNTAX_WORD_ORDER_WEIGHT ?? 14
  ),
  [AiParameterType.PausePatterns]: Number(
    process.env.NEXT_PUBLIC_PAUSE_PATTERNS_WEIGHT ?? 11
  ),
  [AiParameterType.TaskCompletion]: Number(
    process.env.NEXT_PUBLIC_TASK_COMPLETION_WEIGHT ?? 14
  ),
};
// export const activeLanguage = !isProduction ? "en" : "ar"
export const supportedLanguages=["en","he","ar"]
export const defaultLanguage= "en"
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const disclaimerLink = "https://ibrani.ai/disclaimer"

// Feature flag for parallel AI evaluation processing
export const USE_PARALLEL_EVALUATION = process.env.USE_PARALLEL_EVALUATION === 'true';