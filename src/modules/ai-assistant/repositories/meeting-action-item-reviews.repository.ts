import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MeetingActionItemReview } from '../entities/meeting-action-item-review.entity';

@Injectable()
export class MeetingActionItemReviewsRepository {
  constructor(
    @InjectRepository(MeetingActionItemReview)
    private readonly reviews: Repository<MeetingActionItemReview>,
  ) {}

  findBySummary(summaryId: string) {
    return this.reviews.find({
      where: { summaryId },
      order: { actionItemIndex: 'ASC' },
    });
  }

  findOne(summaryId: string, actionItemIndex: number) {
    return this.reviews.findOne({ where: { summaryId, actionItemIndex } });
  }

  save(data: Partial<MeetingActionItemReview>) {
    return this.reviews.save(this.reviews.create(data));
  }
}
