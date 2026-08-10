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
exports.TaskCommentsRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_comment_entity_1 = require("../entities/task-comment.entity");
let TaskCommentsRepository = class TaskCommentsRepository {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    create(data) {
        return this.repository.save(this.repository.create(data));
    }
    findByTask(taskId) {
        return this.repository.find({
            where: { taskId, deletedAt: (0, typeorm_2.IsNull)() },
            relations: { author: true },
            order: { createdAt: 'ASC' },
            take: 200,
        });
    }
    findById(id, taskId) {
        return this.repository.findOne({
            where: { id, taskId, deletedAt: (0, typeorm_2.IsNull)() },
            relations: { author: true },
        });
    }
    update(comment, data) {
        Object.assign(comment, data);
        return this.repository.save(comment);
    }
    softDelete(comment) {
        return this.repository.softRemove(comment);
    }
};
exports.TaskCommentsRepository = TaskCommentsRepository;
exports.TaskCommentsRepository = TaskCommentsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_comment_entity_1.TaskComment)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TaskCommentsRepository);
//# sourceMappingURL=task-comments.repository.js.map