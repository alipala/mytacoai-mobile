/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Flashcard } from './Flashcard';
export type FlashcardSet = {
    id: string;
    session_id: string;
    user_id: string;
    language: string;
    level: string;
    topic?: (string | null);
    title: string;
    description: string;
    flashcards: Array<Flashcard>;
    total_cards: number;
    created_at?: string;
    is_completed?: boolean;
    completed_at?: (string | null);
};

