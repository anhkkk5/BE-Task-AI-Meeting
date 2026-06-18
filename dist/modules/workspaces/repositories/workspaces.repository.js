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
exports.WorkspacesRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const workspace_status_enum_1 = require("../../../common/enums/workspace-status.enum");
const workspace_entity_1 = require("../entities/workspace.entity");
let WorkspacesRepository = class WorkspacesRepository {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    create(data, manager) {
        const repository = this.getRepository(manager);
        const workspace = repository.create(data);
        return repository.save(workspace);
    }
    findById(id) {
        return this.repository.findOne({ where: { id } });
    }
    findBySlug(slug) {
        return this.repository.findOne({ where: { slug } });
    }
    async update(id, data) {
        await this.repository.update(id, data);
        return this.findById(id);
    }
    async archive(id) {
        await this.repository.update(id, { status: workspace_status_enum_1.WorkspaceStatus.Archived });
    }
    getRepository(manager) {
        return manager ? manager.getRepository(workspace_entity_1.Workspace) : this.repository;
    }
};
exports.WorkspacesRepository = WorkspacesRepository;
exports.WorkspacesRepository = WorkspacesRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(workspace_entity_1.Workspace)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], WorkspacesRepository);
//# sourceMappingURL=workspaces.repository.js.map