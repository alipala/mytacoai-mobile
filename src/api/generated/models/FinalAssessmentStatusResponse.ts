/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type FinalAssessmentStatusResponse = {
    required: boolean;
    status: string;
    all_sessions_completed: boolean;
    completed_sessions: number;
    total_sessions: number;
    last_attempt?: (Record<string, any> | null);
    can_retry: boolean;
    attempts_count: number;
    passed: boolean;
    message: string;
};

