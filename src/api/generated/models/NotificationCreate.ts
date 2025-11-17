/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type NotificationCreate = {
    title: string;
    content: string;
    notification_type: string;
    target_user_ids?: (Array<string> | null);
    send_immediately?: boolean;
    scheduled_send_time?: (string | null);
};

