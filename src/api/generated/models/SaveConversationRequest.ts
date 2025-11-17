/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SaveConversationRequest = {
    language: string;
    level: string;
    topic?: (string | null);
    messages: Array<Record<string, any>>;
    duration_minutes: number;
    learning_plan_id?: (string | null);
    conversation_type?: (string | null);
    sentences_for_analysis?: null;
};

