"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MeetingLifecycleService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingLifecycleService = void 0;
const common_1 = require("@nestjs/common");
let MeetingLifecycleService = MeetingLifecycleService_1 = class MeetingLifecycleService {
    logger = new common_1.Logger(MeetingLifecycleService_1.name);
    completedListeners = new Set();
    onMeetingCompleted(listener) {
        this.completedListeners.add(listener);
        return () => this.completedListeners.delete(listener);
    }
    publishMeetingCompleted(event) {
        for (const listener of this.completedListeners) {
            void Promise.resolve(listener(event)).catch((error) => {
                const message = error instanceof Error ? error.message : String(error);
                this.logger.error(`Xu ly su kien ket thuc cuoc hop that bai: ${message}`);
            });
        }
    }
};
exports.MeetingLifecycleService = MeetingLifecycleService;
exports.MeetingLifecycleService = MeetingLifecycleService = MeetingLifecycleService_1 = __decorate([
    (0, common_1.Injectable)()
], MeetingLifecycleService);
//# sourceMappingURL=meeting-lifecycle.service.js.map