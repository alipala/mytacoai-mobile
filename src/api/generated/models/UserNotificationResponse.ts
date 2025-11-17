/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NotificationResponse } from './NotificationResponse';
export type UserNotificationResponse = {
    user_id: string;
    notification_id: string;
    is_read?: boolean;
    read_at?: (string | null);
    _id: string;
    notification: NotificationResponse;
    created_at: string;
};

