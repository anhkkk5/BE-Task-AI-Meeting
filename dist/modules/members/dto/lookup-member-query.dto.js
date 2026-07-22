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
exports.LookupMemberQueryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class LookupMemberQueryDto {
    email;
}
exports.LookupMemberQueryDto = LookupMemberQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'member@example.com',
        description: 'Email user can tim truoc khi them vao workspace.',
    }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], LookupMemberQueryDto.prototype, "email", void 0);
//# sourceMappingURL=lookup-member-query.dto.js.map