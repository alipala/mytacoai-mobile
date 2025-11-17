/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type NotificationResponse = {
    title: string;
    content: string;
    notification_type: string;
    target_user_ids?: (Array<string> | null);
    send_immediately?: boolean;
    scheduled_send_time?: (string | null);
    created_by: string;
    _id: string;
    created_at: string;
    sent_at?: (string | null);
    is_sent?: boolean;
};

