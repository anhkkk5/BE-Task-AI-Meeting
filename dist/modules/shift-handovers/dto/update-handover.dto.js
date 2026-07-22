"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateHandoverDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_handover_dto_1 = require("./create-handover.dto");
class UpdateHandoverDto extends (0, swagger_1.PartialType)((0, swagger_1.OmitType)(create_handover_dto_1.CreateHandoverDto, ['taskId'])) {
}
exports.UpdateHandoverDto = UpdateHandoverDto;
//# sourceMappingURL=update-handover.dto.js.map