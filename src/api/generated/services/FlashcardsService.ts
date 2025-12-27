/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Flashcard } from '../models/Flashcard';
import type { FlashcardGenerationRequest } from '../models/FlashcardGenerationRequest';
import type { FlashcardProgress } from '../models/FlashcardProgress';
import type { FlashcardReviewRequest } from '../models/FlashcardReviewRequest';
import type { FlashcardSet } from '../models/FlashcardSet';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FlashcardsService {
    /**
     * Generate Flashcards
     * Generate AI-powered flashcards from a speaking session
     * @param requestBody
     * @returns FlashcardSet Successful Response
     * @throws ApiError
     */
    public static generateFlashcardsApiFlashcardsGeneratePost(
        requestBody: FlashcardGenerationRequest,
    ): CancelablePromise<FlashcardSet> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/flashcards/generate',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get User Flashcard Sets
     * Get all flashcard sets for the current user
     * @returns FlashcardSet Successful Response
     * @throws ApiError
     */
    public static getUserFlashcardSetsApiFlashcardsSetsGet(): CancelablePromise<Array<FlashcardSet>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/flashcards/sets',
        });
    }
    /**
     * Get Flashcard Set
     * Get a specific flashcard set with all its flashcards
     * @param setId
     * @returns FlashcardSet Successful Response
     * @throws ApiError
     */
    public static getFlashcardSetApiFlashcardsSetSetIdGet(
        setId: string,
    ): CancelablePromise<FlashcardSet> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/flashcards/set/{set_id}',
            path: {
                'set_id': setId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Flashcard Set
     * Delete a flashcard set and all its associated flashcards
     * @param setId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteFlashcardSetApiFlashcardsSetSetIdDelete(
        setId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/flashcards/set/{set_id}',
            path: {
                'set_id': setId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Due Flashcards
     * Get flashcards that are due for review
     * @param limit
     * @returns Flashcard Successful Response
     * @throws ApiError
     */
    public static getDueFlashcardsApiFlashcardsDueGet(
        limit: number = 10,
    ): CancelablePromise<Array<Flashcard>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/flashcards/due',
            query: {
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Review Flashcard
     * Update flashcard progress after review
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static reviewFlashcardApiFlashcardsReviewPost(
        requestBody: FlashcardReviewRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/flashcards/review',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Flashcard Progress
     * Get overall flashcard progress statistics
     * @returns FlashcardProgress Successful Response
     * @throws ApiError
     */
    public static getFlashcardProgressApiFlashcardsProgressGet(): CancelablePromise<FlashcardProgress> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/flashcards/progress',
        });
    }
    /**
     * Get Flashcards For Session
     * Get all flashcards for a specific session
     * @param sessionId
     * @returns Flashcard Successful Response
     * @throws ApiError
     */
    public static getFlashcardsForSessionApiFlashcardsSessionSessionIdGet(
        sessionId: string,
    ): CancelablePromise<Array<Flashcard>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/flashcards/session/{session_id}',
            path: {
                'session_id': sessionId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
