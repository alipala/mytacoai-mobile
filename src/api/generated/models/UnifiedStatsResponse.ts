/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DailyStatsResponse } from './DailyStatsResponse';
import type { LifetimeProgressResponse } from './LifetimeProgressResponse';
import type { RecentPerformanceResponse } from './RecentPerformanceResponse';
export type UnifiedStatsResponse = {
    success?: boolean;
    daily: DailyStatsResponse;
    recent: RecentPerformanceResponse;
    lifetime: LifetimeProgressResponse;
};

