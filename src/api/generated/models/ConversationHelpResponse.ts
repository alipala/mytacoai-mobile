/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CulturalNote } from './CulturalNote';
import type { GrammarTip } from './GrammarTip';
import type { SuggestedResponse } from './SuggestedResponse';
import type { VocabularyItem } from './VocabularyItem';
export type ConversationHelpResponse = {
    ai_response_summary: string;
    suggested_responses: Array<SuggestedResponse>;
    vocabulary_highlights: Array<VocabularyItem>;
    grammar_tips: Array<GrammarTip>;
    cultural_context?: (CulturalNote | null);
    generated_at?: string;
};

