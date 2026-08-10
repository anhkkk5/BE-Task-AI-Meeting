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
exports.TaskDependenciesRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_dependency_entity_1 = require("../entities/task-dependency.entity");
const task_dependency_type_enum_1 = require("../../../common/enums/task-dependency-type.enum");
let TaskDependenciesRepository = class TaskDependenciesRepository {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    create(data) { return this.repository.save(this.repository.create(data)); }
    findDuplicate(sourceTaskId, targetTaskId, type) { return this.repository.findOne({ where: { sourceTaskId, targetTaskId, type } }); }
    findByTask(taskId) {
        return this.repository.createQueryBuilder('dependency')
            .leftJoinAndSelect('dependency.sourceTask', 'sourceTask')
            .leftJoinAndSelect('dependency.targetTask', 'targetTask')
            .where('dependency.source_task_id = :taskId OR dependency.target_task_id = :taskId', { taskId })
            .orderBy('dependency.created_at', 'DESC').getMany();
    }
    findByProject(projectId) {
        return this.repository.createQueryBuilder('dependency')
            .innerJoin('dependency.sourceTask', 'sourceTask')
            .where('sourceTask.project_id = :projectId', { projectId }).getMany();
    }
    findOwned(id) { return this.repository.findOne({ where: { id } }); }
    remove(item) { return this.repository.remove(item); }
    findIncompleteBlockers(taskId) {
        return this.repository.createQueryBuilder('dependency')
            .leftJoinAndSelect('dependency.sourceTask', 'sourceTask')
            .leftJoinAndSelect('dependency.targetTask', 'targetTask')
            .leftJoin('workflow_statuses', 'sourceStatus', 'sourceStatus.id = sourceTask.workflow_status_id')
            .leftJoin('workflow_statuses', 'targetStatus', 'targetStatus.id = targetTask.workflow_status_id')
            .where('(dependency.type = :dependsOn AND dependency.source_task_id = :taskId AND targetStatus.category != :doneCategory)', { dependsOn: task_dependency_type_enum_1.TaskDependencyType.DependsOn, taskId, doneCategory: 'DONE' })
            .orWhere('(dependency.type = :blocks AND dependency.target_task_id = :taskId AND sourceStatus.category != :doneCategory)', { blocks: task_dependency_type_enum_1.TaskDependencyType.Blocks, taskId, doneCategory: 'DONE' })
            .getMany();
    }
    findTasksUnblockedBy(blockerTaskId) {
        return this.repository.createQueryBuilder('dependency')
            .leftJoinAndSelect('dependency.sourceTask', 'sourceTask')
            .leftJoinAndSelect('dependency.targetTask', 'targetTask')
            .where('(dependency.type = :blocks AND dependency.source_task_id = :taskId)', { blocks: task_dependency_type_enum_1.TaskDependencyType.Blocks, taskId: blockerTaskId })
            .orWhere('(dependency.type = :dependsOn AND dependency.target_task_id = :taskId)', { dependsOn: task_dependency_type_enum_1.TaskDependencyType.DependsOn, taskId: blockerTaskId })
            .getMany();
    }
};
exports.TaskDependenciesRepository = TaskDependenciesRepository;
exports.TaskDependenciesRepository = TaskDependenciesRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_dependency_entity_1.TaskDependency)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TaskDependenciesRepository);
//# sourceMappingURL=task-dependencies.repository.js.map