/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SkillScore } from './SkillScore';
export type SpeakingAssessmentResponse = {
    recognized_text: string;
    recommended_level: string;
    overall_score: number;
    confidence: number;
    pronunciation: SkillScore;
    grammar: SkillScore;
    vocabulary: SkillScore;
    fluency: SkillScore;
    coherence: SkillScore;
    strengths: Array<string>;
    areas_for_improvement: Array<string>;
    next_steps: Array<string>;
};

