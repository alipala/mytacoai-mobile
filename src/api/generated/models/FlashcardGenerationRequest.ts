/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type FlashcardGenerationRequest = {
    session_id: string;
    language: string;
    level: string;
    topic?: (string | null);
    conversation_content?: (string | null);
    session_summary?: (string | null);
    count?: number;
};

