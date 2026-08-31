// Backward-compatibility shim — delegates to the new Laravel review service.
import { ReviewService as LaravelReviewService } from './review.service';
import type { Review, ReviewStats, PaginatedResponse } from './types';

export type { Review, ReviewStats, PaginatedResponse };

export class ReviewService extends LaravelReviewService {}
