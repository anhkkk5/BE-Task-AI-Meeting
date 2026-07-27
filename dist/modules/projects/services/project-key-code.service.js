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
exports.ProjectKeyCodeService = void 0;
const common_1 = require("@nestjs/common");
const projects_repository_1 = require("../repositories/projects.repository");
const keyCodeMaxLength = 20;
const fallbackKeyCode = 'PRJ';
let ProjectKeyCodeService = class ProjectKeyCodeService {
    projectsRepository;
    constructor(projectsRepository) {
        this.projectsRepository = projectsRepository;
    }
    removeDiacritics(value) {
        return value
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\u0111/g, 'd')
            .replace(/\u0110/g, 'D');
    }
    buildBaseKeyCode(name) {
        const words = this.removeDiacritics(name)
            .toUpperCase()
            .replace(/[^A-Z0-9\s_]/g, ' ')
            .split(/[\s_]+/)
            .filter((word) => word.length > 0);
        if (words.length === 0) {
            return fallbackKeyCode;
        }
        const base = words.length > 1
            ? words.map((word) => word[0]).join('')
            : words[0].slice(0, 4);
        const normalized = /^[0-9]/.test(base) ? `${fallbackKeyCode}${base}` : base;
        return normalized.slice(0, keyCodeMaxLength) || fallbackKeyCode;
    }
    async generateUniqueKeyCode(workspaceId, name) {
        const base = this.buildBaseKeyCode(name);
        const existing = await this.projectsRepository.findKeyCodesByPrefix(workspaceId, base);
        const taken = new Set(existing.map((keyCode) => keyCode.toUpperCase()));
        if (!taken.has(base)) {
            return base;
        }
        for (let suffix = 2;; suffix += 1) {
            const suffixText = String(suffix);
            const trimmedBase = base.slice(0, keyCodeMaxLength - suffixText.length);
            const candidate = `${trimmedBase}${suffixText}`;
            if (!taken.has(candidate)) {
                return candidate;
            }
        }
    }
};
exports.ProjectKeyCodeService = ProjectKeyCodeService;
exports.ProjectKeyCodeService = ProjectKeyCodeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [projects_repository_1.ProjectsRepository])
], ProjectKeyCodeService);
//# sourceMappingURL=project-key-code.service.js.map