/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SessionService {
    /**
     * Session Heartbeat
     * Handle session heartbeat from frontend
     * This endpoint receives periodic heartbeat signals from active sessions
     * 🔥 FIXED: Now properly saves sessions and deducts minutes when threshold is reached
     * @returns any Successful Response
     * @throws ApiError
     */
    public static sessionHeartbeatApiSessionHeartbeatPost(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/session-heartbeat',
        });
    }
}
