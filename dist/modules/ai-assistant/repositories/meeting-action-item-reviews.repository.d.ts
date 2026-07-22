import { Repository } from 'typeorm';
import { MeetingActionItemReview } from '../entities/meeting-action-item-review.entity';
export declare class MeetingActionItemReviewsRepository {
    private readonly reviews;
    constructor(reviews: Repository<MeetingActionItemReview>);
    findBySummary(summaryId: string): Promise<MeetingActionItemReview[]>;
    findOne(summaryId: string, actionItemIndex: number): Promise<MeetingActionItemReview | null>;
    save(data: Partial<MeetingActionItemReview>): Promise<MeetingActionItemReview>;
}
