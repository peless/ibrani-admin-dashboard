export type V3Session = {
    session_id: string;
    created_at: string | null;
    total_questions: number | null;
    completed_questions: number | null;
    failed_questions: number | null;
    processing_questions: number | null;
    status: 'in_progress' | 'ready_for_aggregation' | 'completed' | 'failed';
    last_activity: string | null;
    can_aggregate: boolean | null;
};
import { generateUniqueTestCode } from '@/utils/generateUniqueTestCode';
import { supabase } from '.';


export class V3SessionService {
    table = 'v3_sessions';

    async createSession(data?: Partial<V3Session>): Promise<V3Session | null> {
        const defaults = {
            total_questions: 4,
            completed_questions: 0,
            failed_questions: 0,
            processing_questions: 0,
            status: 'in_progress',
            can_aggregate: false
        };
        const user_test_code=await generateUniqueTestCode();
       
        const insertData = { ...defaults, ...data, user_test_code };

        const { data: inserted, error } = await supabase
            .from(this.table)
            .insert(insertData)
            .select()
            .single();

        if (error) {
            console.error('Error creating session:', error);
            return null;
        }

        return inserted;
    }

    async getSessionById(session_id: string): Promise<V3Session | null> {
        const { data, error } = await supabase
            .from(this.table)
            .select('*')
            .eq('session_id', session_id)
            .single();

        if (error) {
            console.error('Error fetching session:', error);
            return null;
        }

        return data;
    }

    async updateSession(
        session_id: string,
        updates: Partial<V3Session>
    ): Promise<V3Session | null> {
        const { data, error } = await supabase
            .from(this.table)
            .update(updates)
            .eq('session_id', session_id)
            .select()
            .single();

        if (error) {
            console.error('Error updating session:', error);
            return null;
        }

        return data;
    }

    async deleteSession(session_id: string): Promise<boolean> {
        const { error } = await supabase
            .from(this.table)
            .delete()
            .eq('session_id', session_id);

        if (error) {
            console.error('Error deleting session:', error);
            return false;
        }

        return true;
    }
}
const v3SessionService = new V3SessionService();
export default v3SessionService;