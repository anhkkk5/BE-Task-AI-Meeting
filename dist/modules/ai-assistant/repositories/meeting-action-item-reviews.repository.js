"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingActionItemReviewsRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const meeting_action_item_review_entity_1 = require("../entities/meeting-action-item-review.entity");
let MeetingActionItemReviewsRepository = class MeetingActionItemReviewsRepository {
    reviews;
    constructor(reviews) {
        this.reviews = reviews;
    }
    findBySummary(summaryId) {
        return this.reviews.find({
            where: { summaryId },
            order: { actionItemIndex: 'ASC' },
        });
    }
    findOne(summaryId, actionItemIndex) {
        return this.reviews.findOne({ where: { summaryId, actionItemIndex } });
    }
    save(data) {
        return this.reviews.save(this.reviews.create(data));
    }
};
exports.MeetingActionItemReviewsRepository = MeetingActionItemReviewsRepository;
exports.MeetingActionItemReviewsRepository = MeetingActionItemReviewsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(meeting_action_item_review_entity_1.MeetingActionItemReview)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MeetingActionItemReviewsRepository);
//# sourceMappingURL=meeting-action-item-reviews.repository.js.map