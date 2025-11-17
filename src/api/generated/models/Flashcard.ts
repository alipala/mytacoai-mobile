/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Flashcard = {
    id: string;
    session_id: string;
    user_id: string;
    language: string;
    level: string;
    topic?: (string | null);
    front: string;
    back: string;
    category: string;
    difficulty: string;
    tags?: Array<string>;
    created_at?: string;
    last_reviewed?: (string | null);
    review_count?: number;
    correct_count?: number;
    incorrect_count?: number;
    mastery_level?: number;
    next_review_date?: (string | null);
    is_active?: boolean;
};

