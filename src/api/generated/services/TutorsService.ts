/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TutorAcceptInviteRequest } from '../models/TutorAcceptInviteRequest';
import type { TutorInviteRequest } from '../models/TutorInviteRequest';
import type { TutorResponse } from '../models/TutorResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TutorsService {
    /**
     * Invite Tutor
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static inviteTutorTutorsInvitePost(
        requestBody: TutorInviteRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/tutors/invite',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Accept Invitation
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static acceptInvitationTutorsAcceptInvitePost(
        requestBody: TutorAcceptInviteRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/tutors/accept-invite',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Institution Tutors
     * @param institutionId
     * @returns TutorResponse Successful Response
     * @throws ApiError
     */
    public static getInstitutionTutorsTutorsInstitutionInstitutionIdGet(
        institutionId: string,
    ): CancelablePromise<Array<TutorResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/tutors/institution/{institution_id}',
            path: {
                'institution_id': institutionId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
