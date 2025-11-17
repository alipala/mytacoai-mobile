/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SentenceAssessmentRequest = {
    audio_base64?: (string | null);
    transcript?: (string | null);
    language: string;
    level: string;
    exercise_type?: (string | null);
    target_grammar?: (Array<string> | null);
    context?: (string | null);
};

