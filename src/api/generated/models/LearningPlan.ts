/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type LearningPlan = {
    id: string;
    user_id?: (string | null);
    language: string;
    proficiency_level: string;
    goals: Array<string>;
    duration_months: number;
    custom_goal?: (string | null);
    plan_content: Record<string, any>;
    assessment_data?: (Record<string, any> | null);
    created_at: string;
    updated_at?: (string | null);
    total_sessions?: (number | null);
    completed_sessions?: (number | null);
    progress_percentage?: (number | null);
    practice_minutes_used?: (number | null);
    session_summaries?: (Array<string> | null);
    status?: (string | null);
    final_assessment?: (Record<string, any> | null);
    all_sessions_completed_at?: (string | null);
    from_final_assessment?: (boolean | null);
    previous_plan_id?: (string | null);
};

