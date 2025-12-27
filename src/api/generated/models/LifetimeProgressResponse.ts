/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LifetimeSummary } from './LifetimeSummary';
export type LifetimeProgressResponse = {
    success?: boolean;
    summary: LifetimeSummary;
    language_progress: Record<string, Record<string, any>>;
    level_mastery: Record<string, Record<string, any>>;
    challenge_type_mastery: Record<string, Record<string, any>>;
    learning_path: Record<string, any>;
    achievements?: (Record<string, any> | null);
    milestones?: (Record<string, any> | null);
    metadata: Record<string, any>;
};

