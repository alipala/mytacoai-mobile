/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NotificationCreate } from '../models/NotificationCreate';
import type { NotificationDeleteRequest } from '../models/NotificationDeleteRequest';
import type { NotificationListResponse } from '../models/NotificationListResponse';
import type { NotificationMarkReadRequest } from '../models/NotificationMarkReadRequest';
import type { NotificationResponse } from '../models/NotificationResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class NotificationsService {
    /**
     * Create Notification
     * Create a new notification (Admin only)
     * @param requestBody
     * @returns NotificationResponse Successful Response
     * @throws ApiError
     */
    public static createNotificationApiAdminNotificationsPost(
        requestBody: NotificationCreate,
    ): CancelablePromise<NotificationResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/notifications',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Notifications Admin
     * List all notifications (Admin only)
     * @param page
     * @param perPage
     * @param sortField
     * @param sortOrder
     * @returns any Successful Response
     * @throws ApiError
     */
    public static listNotificationsAdminApiAdminNotificationsGet(
        page: number = 1,
        perPage: number = 25,
        sortField: string = 'created_at',
        sortOrder: string = 'desc',
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/notifications',
            query: {
                'page': page,
                'per_page': perPage,
                'sort_field': sortField,
                'sort_order': sortOrder,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Notification Admin
     * Get a specific notification (Admin only)
     * @param notificationId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getNotificationAdminApiAdminNotificationsNotificationIdGet(
        notificationId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/notifications/{notification_id}',
            path: {
                'notification_id': notificationId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Notification Admin
     * Update a notification (Admin only)
     * @param notificationId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static updateNotificationAdminApiAdminNotificationsNotificationIdPut(
        notificationId: string,
        requestBody: NotificationCreate,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/admin/notifications/{notification_id}',
            path: {
                'notification_id': notificationId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Notification Admin
     * Delete a notification (Admin only)
     * @param notificationId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteNotificationAdminApiAdminNotificationsNotificationIdDelete(
        notificationId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/admin/notifications/{notification_id}',
            path: {
                'notification_id': notificationId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get User Notifications
     * Get notifications for the current user
     * @param skip
     * @param limit
     * @param unreadOnly
     * @returns NotificationListResponse Successful Response
     * @throws ApiError
     */
    public static getUserNotificationsApiGet(
        skip?: number,
        limit: number = 20,
        unreadOnly: boolean = false,
    ): CancelablePromise<NotificationListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/',
            query: {
                'skip': skip,
                'limit': limit,
                'unread_only': unreadOnly,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Unread Count
     * Get count of unread notifications for the current user
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getUnreadCountApiUnreadCountGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/unread-count',
        });
    }
    /**
     * Mark Notification Read
     * Mark a notification as read (idempotent - safe to call multiple times)
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static markNotificationReadApiMarkReadPost(
        requestBody: NotificationMarkReadRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/mark-read',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Mark All Notifications Read
     * Mark all notifications as read for the current user
     * @returns any Successful Response
     * @throws ApiError
     */
    public static markAllNotificationsReadApiMarkAllReadPost(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/mark-all-read',
        });
    }
    /**
     * Delete Notification
     * Soft delete a notification for the current user
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteNotificationApiNotificationsDeletePost(
        requestBody: NotificationDeleteRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/notifications/delete',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Users For Notifications
     * Get list of users for notification targeting (Admin only)
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getUsersForNotificationsApiAdminNotificationsAdminUsersGet(): CancelablePromise<Array<Record<string, any>>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/notifications/admin/users',
        });
    }
}
