/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DailyBreakdownItem } from './DailyBreakdownItem';
import type { LanguageDistribution } from './LanguageDistribution';
import type { RecentPerformanceInsights } from './RecentPerformanceInsights';
import type { RecentPerformanceSummary } from './RecentPerformanceSummary';
export type RecentPerformanceResponse = {
    success?: boolean;
    window: Record<string, any>;
    summary: RecentPerformanceSummary;
    insights: RecentPerformanceInsights;
    daily_breakdown: Array<DailyBreakdownItem>;
    language_distribution: Record<string, LanguageDistribution>;
    type_distribution: Record<string, LanguageDistribution>;
    level_performance: Record<string, Record<string, any>>;
    metadata: Record<string, any>;
};

