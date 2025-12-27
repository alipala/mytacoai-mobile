/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DailyStatsBreakdown } from './DailyStatsBreakdown';
import type { DailyStatsOverall } from './DailyStatsOverall';
import type { StreakInfo } from './StreakInfo';
export type DailyStatsResponse = {
    success?: boolean;
    date: string;
    timezone: string;
    overall: DailyStatsOverall;
    by_language: Record<string, DailyStatsBreakdown>;
    by_level: Record<string, DailyStatsBreakdown>;
    by_type: Record<string, DailyStatsBreakdown>;
    streak: StreakInfo;
    metadata: Record<string, any>;
};

