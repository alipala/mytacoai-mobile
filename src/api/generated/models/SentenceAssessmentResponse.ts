/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GrammarIssue } from './GrammarIssue';
export type SentenceAssessmentResponse = {
    recognized_text: string;
    grammatical_score: number;
    vocabulary_score: number;
    complexity_score: number;
    appropriateness_score: number;
    overall_score: number;
    grammar_issues: Array<GrammarIssue>;
    improvement_suggestions: Array<string>;
    corrected_text?: (string | null);
    level_appropriate_alternatives?: (Array<string> | null);
};

