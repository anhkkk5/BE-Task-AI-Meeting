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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateHandoverDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateHandoverDto {
    taskId;
    receiverId;
    completedWork;
    remainingWork;
    blockers;
    nextSteps;
    referenceLinks;
    dueAt;
}
exports.CreateHandoverDto = CreateHandoverDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Task đang được người giao phụ trách.',
        example: '2f7b08fd-82f8-4bee-8c5f-8fb9fc796463',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateHandoverDto.prototype, "taskId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Thành viên sẽ tiếp nhận task.',
        example: '775409e6-5714-4cef-a95f-fbacb5da3353',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateHandoverDto.prototype, "receiverId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Những phần đã hoàn thành trên task.',
        example: 'Đã hoàn thành API đăng nhập và kiểm thử unit.',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], CreateHandoverDto.prototype, "completedWork", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Những phần người nhận cần tiếp tục thực hiện.',
        example: 'Kết nối màn hình đăng nhập với API và kiểm thử trên điện thoại.',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], CreateHandoverDto.prototype, "remainingWork", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Khó khăn hoặc vấn đề đang chặn công việc.',
        example: 'Cookie HttpOnly chưa hoạt động khi truy cập qua địa chỉ LAN.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], CreateHandoverDto.prototype, "blockers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Hướng xử lý tiếp theo được đề xuất.',
        example: 'Kiểm tra cấu hình CORS và SameSite của refresh token.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], CreateHandoverDto.prototype, "nextSteps", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Mỗi dòng là một branch, tài liệu hoặc đường dẫn tham khảo.',
        example: 'feat/auth-cookie\nhttps://docs.example.com/auth',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], CreateHandoverDto.prototype, "referenceLinks", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Hạn tiếp tục xử lý sau khi nhận bàn giao.',
        example: '2026-07-25T17:00:00.000Z',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateHandoverDto.prototype, "dueAt", void 0);
//# sourceMappingURL=create-handover.dto.js.map