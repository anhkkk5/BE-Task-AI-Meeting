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
exports.GetWorkspacesQueryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const workspace_status_enum_1 = require("../../../common/enums/workspace-status.enum");
class GetWorkspacesQueryDto {
    status;
}
exports.GetWorkspacesQueryDto = GetWorkspacesQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: workspace_status_enum_1.WorkspaceStatus,
        example: workspace_status_enum_1.WorkspaceStatus.Active,
        description: 'Loc workspace theo status.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(workspace_status_enum_1.WorkspaceStatus),
    __metadata("design:type", String)
], GetWorkspacesQueryDto.prototype, "status", void 0);
//# sourceMappingURL=get-workspaces-query.dto.js.map