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
    total_sessions?: (number | null);
    completed_sessions?: (number | null);
    progress_percentage?: (number | null);
    session_summaries?: (Array<string> | null);
    status?: (string | null);
    final_assessment?: (Record<string, any> | null);
    all_sessions_completed_at?: (string | null);
};

