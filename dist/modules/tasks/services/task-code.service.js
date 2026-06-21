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
exports.TaskCodeService = void 0;
const common_1 = require("@nestjs/common");
const tasks_repository_1 = require("../repositories/tasks.repository");
let TaskCodeService = class TaskCodeService {
    tasksRepository;
    constructor(tasksRepository) {
        this.tasksRepository = tasksRepository;
    }
    async generateTaskCode(project) {
        const count = await this.tasksRepository.countByProject(project.id);
        return `${project.keyCode}-${count + 1}`;
    }
};
exports.TaskCodeService = TaskCodeService;
exports.TaskCodeService = TaskCodeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tasks_repository_1.TasksRepository])
], TaskCodeService);
//# sourceMappingURL=task-code.service.js.map