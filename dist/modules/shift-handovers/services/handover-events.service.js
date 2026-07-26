"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HandoverEventsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandoverEventsService = void 0;
const common_1 = require("@nestjs/common");
let HandoverEventsService = HandoverEventsService_1 = class HandoverEventsService {
    logger = new common_1.Logger(HandoverEventsService_1.name);
    listeners = new Set();
    onHandoverEvent(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    publish(event) {
        for (const listener of this.listeners) {
            void Promise.resolve(listener(event)).catch((error) => {
                const message = error instanceof Error ? error.message : String(error);
                this.logger.error(`Xu ly su kien ban giao "${event.type}" that bai: ${message}`);
            });
        }
    }
};
exports.HandoverEventsService = HandoverEventsService;
exports.HandoverEventsService = HandoverEventsService = HandoverEventsService_1 = __decorate([
    (0, common_1.Injectable)()
], HandoverEventsService);
//# sourceMappingURL=handover-events.service.js.map