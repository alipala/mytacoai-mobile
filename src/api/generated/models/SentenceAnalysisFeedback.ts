/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SentenceAnalysisFeedback = {
    session_id: string;
    feedback_type: string;
    sentence_text: string;
    language: string;
    level: string;
    analysis_decision: Record<string, any>;
    user_rating?: (number | null);
    user_comment?: (string | null);
    expected_outcome?: (string | null);
    session_duration?: (number | null);
    retry_count?: (number | null);
    conversation_context?: (Array<string> | null);
};

