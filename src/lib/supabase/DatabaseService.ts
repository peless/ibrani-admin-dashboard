// SupabaseService.ts
import { supabase } from '.'; // Make sure to install: npm install @supabase/supabase-js
import {
    Assessment,
    AiDetection,
    AssessmentMetric,
    AssessmentResult,
    DetectedError,
    GptPrompt,
    ParameterScore,
    ScoringAlgorithm,
    V3Session,
    UserQuestion,
    SystemError, // Assuming you've created this table in Supabase
} from './types';
import {
    AssessmentStatus,
    AiParameterType,
    ScoreParameterType,
    ErrorCategoryType,
    ErrorSeverity,
    CefrLevelType,
} from './enums';
import { SupabaseClient } from '@supabase/supabase-js';
import { generateUniqueTestCode } from '@/utils/generateUniqueTestCode';

// This is where you would import your initialized Supabase client
// For example:
// import { supabase } from './supabaseClient'; // assuming you have a file like this

export class AppDbService {
    private supabase: SupabaseClient;

    constructor(supabaseClient: SupabaseClient) {
        this.supabase = supabaseClient;
    }

    // --- Generic CRUD Operations Helpers ---
    // These private helpers reduce repetition for common CRUD patterns

    private async createRecord<T>(tableName: string, data: Partial<T>): Promise<T | null> {
        const { data: inserted, error } = await this.supabase
            .from(tableName)
            .insert(data)
            .select()
            .single();

        if (error) {
            console.error(`Error creating record in ${tableName}:`, error);
            return null;
        }
        return inserted as T; // Type assertion as Supabase returns generic object
    }

    private async getRecordById<T>(tableName: string, idColumn: string, id: string | number): Promise<T | null> {
        const { data, error } = await this.supabase
            .from(tableName)
            .select('*')
            .eq(idColumn, id)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 means "no rows found" which is fine for single()
            console.error(`Error fetching record from ${tableName} by ${idColumn} ${id}:`, error);
            return null;
        }
        return data as T | null;
    }

    private async updateRecord<T>(tableName: string, idColumn: string, id: string | number, updates: Partial<T>): Promise<T | null> {
        const { data, error } = await this.supabase
            .from(tableName)
            .update(updates)
            .eq(idColumn, id)
            .select()
            .single();

        if (error) {
            console.error(`Error updating record in ${tableName} by ${idColumn} ${id}:`, error);
            return null;
        }
        return data as T;
    }

    private async deleteRecord(tableName: string, idColumn: string, id: string | number): Promise<boolean> {
        const { error, count } = await this.supabase
            .from(tableName)
            .delete()
            .eq(idColumn, id)
            .select() // Use select() to get count of deleted rows
            .limit(1); // Limit to 1 for single deletion check

        if (error) {
            console.error(`Error deleting record from ${tableName} by ${idColumn} ${id}:`, error);
            return false;
        }
        return count === 1; // Check if exactly one row was deleted
    }

    private async getAllRecords<T>(tableName: string): Promise<T[]> {
        const { data, error } = await this.supabase
            .from(tableName)
            .select('*');

        if (error) {
            console.error(`Error fetching all records from ${tableName}:`, error);
            return [];
        }
        return data as T[];
    }

    private async getRecordsByColumn<T>(tableName: string, columnName: string, value: any): Promise<T[]> {
        const { data, error } = await this.supabase
            .from(tableName)
            .select('*')
            .eq(columnName, value);

        if (error) {
            console.error(`Error fetching records from ${tableName} by ${columnName} ${value}:`, error);
            return [];
        }
        return data as T[];
    }

    // --- Specific Table CRUD Methods ---

    // Assessments
    async createAssessment(data: Partial<Assessment>): Promise<Assessment | null> {
        return this.createRecord<Assessment>('assessments', data);
    }
    async getAssessmentById(id: string): Promise<Assessment | null> {
        return this.getRecordById<Assessment>('assessments', 'id', id);
    }
    async updateAssessment(id: string, idColumn: string, updates: Partial<Assessment>): Promise<Assessment | null> {
        return this.updateRecord<Assessment>('assessments', idColumn, id, updates);
    }
    async deleteAssessment(id: string): Promise<boolean> {
        return this.deleteRecord('assessments', 'id', id);
    }
    async getAllAssessments(): Promise<Assessment[]> {
        return this.getAllRecords<Assessment>('assessments');
    }

    // AI Detections
    async createAiDetection(data: Omit<AiDetection, 'id' | 'detected_at'>): Promise<AiDetection | null> {
        return this.createRecord<AiDetection>('ai_detections', data);
    }
    async getAiDetectionById(id: string): Promise<AiDetection | null> {
        return this.getRecordById<AiDetection>('ai_detections', 'id', id);
    }
    async updateAiDetection(id: string, updates: Partial<AiDetection>): Promise<AiDetection | null> {
        return this.updateRecord<AiDetection>('ai_detections', 'id', id, updates);
    }
    async deleteAiDetection(id: string): Promise<boolean> {
        return this.deleteRecord('ai_detections', 'id', id);
    }
    async getAiDetectionsByAssessmentId(assessmentId: string): Promise<AiDetection[]> {
        return this.getRecordsByColumn<AiDetection>('ai_detections', 'assessment_id', assessmentId);
    }

    // Assessment Metrics
    async createAssessmentMetric(data: Omit<AssessmentMetric, 'calculated_at'>): Promise<AssessmentMetric | null> {
        return this.createRecord<AssessmentMetric>('assessment_metrics', data);
    }
    async getAssessmentMetricByAssessmentId(assessmentId: string): Promise<AssessmentMetric | null> {
        return this.getRecordById<AssessmentMetric>('assessment_metrics', 'assessment_id', assessmentId);
    }
    async updateAssessmentMetric(assessmentId: string, updates: Partial<AssessmentMetric>): Promise<AssessmentMetric | null> {
        return this.updateRecord<AssessmentMetric>('assessment_metrics', 'assessment_id', assessmentId, updates);
    }
    async deleteAssessmentMetric(assessmentId: string): Promise<boolean> {
        return this.deleteRecord('assessment_metrics', 'assessment_id', assessmentId);
    }

    // Assessment Results
    async createAssessmentResult(data: Omit<AssessmentResult, 'scoring_completed_at'>): Promise<AssessmentResult | null> {
        return this.createRecord<AssessmentResult>('assessment_results', data);
    }
    async getAssessmentResultByAssessmentId(assessmentId: string): Promise<AssessmentResult | null> {
        return this.getRecordById<AssessmentResult>('assessment_results', 'assessment_id', assessmentId);
    }
    async updateAssessmentResult(assessmentId: string, updates: Partial<AssessmentResult>): Promise<AssessmentResult | null> {
        return this.updateRecord<AssessmentResult>('assessment_results', 'assessment_id', assessmentId, updates);
    }
    async deleteAssessmentResult(assessmentId: string): Promise<boolean> {
        return this.deleteRecord('assessment_results', 'assessment_id', assessmentId);
    }

    // Detected Errors
    async createDetectedError(data: Omit<DetectedError, 'id' | 'created_at'>): Promise<DetectedError | null> {
        return this.createRecord<DetectedError>('detected_errors', data);
    }
    async getDetectedErrorById(id: string): Promise<DetectedError | null> {
        return this.getRecordById<DetectedError>('detected_errors', 'id', id);
    }
    async updateDetectedError(id: string, updates: Partial<DetectedError>): Promise<DetectedError | null> {
        return this.updateRecord<DetectedError>('detected_errors', 'id', id, updates);
    }
    async deleteDetectedError(id: string): Promise<boolean> {
        return this.deleteRecord('detected_errors', 'id', id);
    }
    async getDetectedErrorsByAssessmentId(assessmentId: string): Promise<DetectedError[]> {
        return this.getRecordsByColumn<DetectedError>('detected_errors', 'assessment_id', assessmentId);
    }

    // GPT Prompts
    async createGptPrompt(data: Omit<GptPrompt, 'created_at'>): Promise<GptPrompt | null> {
        return this.createRecord<GptPrompt>('gpt_prompts', data);
    }
    async getGptPromptByVersionHash(versionHash: string): Promise<GptPrompt | null> {
        return this.getRecordById<GptPrompt>('gpt_prompts', 'version_hash', versionHash);
    }
    async updateGptPrompt(versionHash: string, updates: Partial<GptPrompt>): Promise<GptPrompt | null> {
        return this.updateRecord<GptPrompt>('gpt_prompts', 'version_hash', versionHash, updates);
    }
    async deleteGptPrompt(versionHash: string): Promise<boolean> {
        return this.deleteRecord('gpt_prompts', 'version_hash', versionHash);
    }
    async getAllGptPrompts(): Promise<GptPrompt[]> {
        return this.getAllRecords<GptPrompt>('gpt_prompts');
    }

    // Parameter Scores
    async createParameterScore(data: Omit<ParameterScore, 'id' | 'calculated_at'>): Promise<ParameterScore | null> {
        return this.createRecord<ParameterScore>('parameter_scores', data);
    }
    async getParameterScoreById(id: string): Promise<ParameterScore | null> {
        return this.getRecordById<ParameterScore>('parameter_scores', 'id', id);
    }
    async updateParameterScore(id: string, updates: Partial<ParameterScore>): Promise<ParameterScore | null> {
        return this.updateRecord<ParameterScore>('parameter_scores', 'id', id, updates);
    }
    async deleteParameterScore(id: string): Promise<boolean> {
        return this.deleteRecord('parameter_scores', 'id', id);
    }
    async getParameterScoresByAssessmentId(assessmentId: string): Promise<ParameterScore[]> {
        return this.getRecordsByColumn<ParameterScore>('parameter_scores', 'assessment_id', assessmentId);
    }

    // Scoring Algorithms
    async createScoringAlgorithm(data: Omit<ScoringAlgorithm, 'is_current'>): Promise<ScoringAlgorithm | null> {
        return this.createRecord<ScoringAlgorithm>('scoring_algorithms', data);
    }
    async getScoringAlgorithmByVersion(version: string): Promise<ScoringAlgorithm | null> {
        return this.getRecordById<ScoringAlgorithm>('scoring_algorithms', 'version', version);
    }
    async updateScoringAlgorithm(version: string, updates: Partial<ScoringAlgorithm>): Promise<ScoringAlgorithm | null> {
        return this.updateRecord<ScoringAlgorithm>('scoring_algorithms', 'version', version, updates);
    }
    async deleteScoringAlgorithm(version: string): Promise<boolean> {
        return this.deleteRecord('scoring_algorithms', 'version', version);
    }
    async getCurrentScoringAlgorithm(): Promise<ScoringAlgorithm | null> {
        const { data, error } = await this.supabase
            .from('scoring_algorithms')
            .select('*')
            .eq('is_current', true)
            .single();
        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching current scoring algorithm:', error);
            return null;
        }
        return data as ScoringAlgorithm | null;
    }

    // V3 Sessions (Integrated from your example)
    async createV3Session(data?: Partial<V3Session>): Promise<V3Session | null> {
        const defaults = {
            total_questions: 4,
            completed_questions: 0,
            failed_questions: 0,
            processing_questions: 0,
            status: AssessmentStatus.InProgress, // Using enum
            can_aggregate: false
        };
        const user_test_code=await generateUniqueTestCode();
        const insertData = { ...defaults, ...data, user_test_code };
        return this.createRecord<V3Session>('v3_sessions', insertData);
    }

    async getV3SessionById(session_id: string): Promise<V3Session | null> {
        return this.getRecordById<V3Session>('v3_sessions', 'session_id', session_id);
    }

    async updateV3Session(session_id: string, idColumn: string, updates: Partial<V3Session>): Promise<V3Session | null> {
        return this.updateRecord<V3Session>('v3_sessions', idColumn, session_id, updates);
    }

    async deleteV3Session(session_id: string): Promise<boolean> {
        return this.deleteRecord('v3_sessions', 'session_id', session_id);
    }

    // User Questions
    async createUserQuestion(data: Omit<UserQuestion, 'id' | 'created_at' | 'updated_ay'>): Promise<UserQuestion | null> {
        return this.createRecord<UserQuestion>('user_questions', data);
    }
    async getUserQuestionById(id: number): Promise<UserQuestion | null> {
        return this.getRecordById<UserQuestion>('user_questions', 'id', id);
    }
    async updateUserQuestion(id: number, updates: Partial<UserQuestion>): Promise<UserQuestion | null> {
        return this.updateRecord<UserQuestion>('user_questions', 'id', id, updates);
    }
    async deleteUserQuestion(id: number): Promise<boolean> {
        return this.deleteRecord('user_questions', 'id', id);
    }
    async getAllUserQuestions(): Promise<UserQuestion[]> {
        return this.getAllRecords<UserQuestion>('user_questions');
    }

    // // System Errors (if applicable)
    // async createSystemError(data: Omit<SystemError, 'id' | 'occurred_at'>): Promise<SystemError | null> {
    //     return this.createRecord<SystemError>('system_errors', data);
    // }
    // async getSystemErrorById(id: string): Promise<SystemError | null> {
    //     return this.getRecordById<SystemError>('system_errors', 'id', id);
    // }
    // async getSystemErrorsByAssessmentId(assessmentId: string): Promise<SystemError[]> {
    //     return this.getRecordsByColumn<SystemError>('system_errors', 'assessment_id', assessmentId);
    // }
    // async updateSystemError(id: string, updates: Partial<SystemError>): Promise<SystemError | null> {
    //     return this.updateRecord<SystemError>('system_errors', 'id', id, updates);
    // }
    // async deleteSystemError(id: string): Promise<boolean> {
    //     return this.deleteRecord('system_errors', 'id', id);
    // }


    // --- Access to PostgreSQL Functions (using Supabase RPC) ---

    /**
     * Calls the `check_assessment_has_valid_transcript` function.
     * @param assessmentId The UUID of the assessment.
     * @returns True if the assessment has a valid transcript, false otherwise.
     */
    async checkAssessmentHasValidTranscript(assessmentId: string): Promise<boolean | null> {
        const { data, error } = await this.supabase.rpc('check_assessment_has_valid_transcript', {
            assessment_uuid: assessmentId
        });
        if (error) {
            console.error('Error calling check_assessment_has_valid_transcript:', error);
            return null;
        }
        return data as boolean;
    }

    /**
     * Calls the `process_stuck_assessments` function.
     * @param stuckThresholdHours The threshold in hours for an assessment to be considered stuck.
     * @returns An object containing cleanup_count and error_count.
     */
    async processStuckAssessments(stuckThresholdHours: number): Promise<{ cleanup_count: number; error_count: number } | null> {
        const { data, error } = await this.supabase.rpc('process_stuck_assessments', {
            stuck_threshold_hours: stuckThresholdHours
        });
        if (error) {
            console.error('Error calling process_stuck_assessments:', error);
            return null;
        }
        // Supabase RPC returns an array of objects for table functions, even if one row
        return (data as [{ cleanup_count: number; error_count: number }])?.[0] || null;
    }

    /**
     * Calls the `get_parameter_scores` function.
     * @param assessmentIds An array of assessment UUIDs.
     * @param paramType The score parameter type (e.g., 'fluency_wpm').
     * @returns A table of assessment IDs, raw scores, and CEFR levels.
     */
    async getParameterScores(assessmentIds: string[], paramType: ScoreParameterType): Promise<{ assessment_id: string; raw_score: number; cefr_level: string }[]> {
        const { data, error } = await this.supabase.rpc('get_parameter_scores', {
            assessment_ids: assessmentIds,
            param_type: paramType
        });
        if (error) {
            console.error('Error calling get_parameter_scores:', error);
            return [];
        }
        return data as { assessment_id: string; raw_score: number; cefr_level: string }[];
    }

    /**
     * Calls the `get_assessment_summary_metrics` function.
     * @returns A table of various assessment summary metrics.
     */
    async getAssessmentSummaryMetrics(): Promise<{ metric_name: string; metric_value: number; metric_description: string }[]> {
        const { data, error } = await this.supabase.rpc('get_assessment_summary_metrics');
        if (error) {
            console.error('Error calling get_assessment_summary_metrics:', error);
            return [];
        }
        return data as { metric_name: string; metric_value: number; metric_description: string }[];
    }

    /**
     * Calls the `get_random_prompt_by_levels_excluding_ids` function.
     * @param levelInputs An array of CEFR level types.
     * @param excludeIds An array of user question IDs to exclude.
     * @returns A single random user question.
     */
    async getRandomPromptByLevelsExcludingIds(levelInputs: CefrLevelType[], excludeIds: number[]): Promise<UserQuestion | null> {
        const { data, error } = await this.supabase.rpc('get_random_prompt_by_levels_excluding_ids', {
            level_inputs: levelInputs,
            exclude_ids: excludeIds
        });
        if (error) {
            console.error('Error calling get_random_prompt_by_levels_excluding_ids:', error);
            return null;
        }
        // Supabase RPC returns an array of objects for table functions, even if one row
        return (data as UserQuestion[])?.[0] || null;
    }
}

// Optionally, export a default instance if your application architecture favors it
// import { supabase } from './supabaseClient'; // Make sure this path is correct
export default new AppDbService(supabase);