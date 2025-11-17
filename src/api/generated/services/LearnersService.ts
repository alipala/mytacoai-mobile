/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LearnerEnrollRequest } from '../models/LearnerEnrollRequest';
import type { LearnerSelfSignupRequest } from '../models/LearnerSelfSignupRequest';
import type { LearnerSelfSignupResponse } from '../models/LearnerSelfSignupResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LearnersService {
    /**
     * Enroll Learner
     * Admin enrolls a learner (sends invitation)
     * @returns any Successful Response
     * @throws ApiError
     */
    public static enrollLearnerLearnersEnrollPost({
        requestBody,
    }: {
        requestBody: LearnerEnrollRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/learners/enroll',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Self Signup
     * Learner signs up using institution code
     * @returns LearnerSelfSignupResponse Successful Response
     * @throws ApiError
     */
    public static selfSignupLearnersSelfSignupPost({
        requestBody,
    }: {
        requestBody: LearnerSelfSignupRequest,
    }): CancelablePromise<LearnerSelfSignupResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/learners/self-signup',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Tutor Learners
     * Get all learners assigned to a tutor
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getTutorLearnersLearnersTutorTutorIdGet({
        tutorId,
    }: {
        tutorId: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/learners/tutor/{tutor_id}',
            path: {
                'tutor_id': tutorId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Institution Learners
     * Get all learners for an institution
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getInstitutionLearnersLearnersInstitutionInstitutionIdGet({
        institutionId,
    }: {
        institutionId: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/learners/institution/{institution_id}',
            path: {
                'institution_id': institutionId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
