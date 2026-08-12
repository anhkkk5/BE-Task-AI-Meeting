"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const users_repository_1 = require("../repositories/users.repository");
let UsersService = class UsersService {
    usersRepository;
    saltRounds = 12;
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    create(data) {
        const user = this.usersRepository.create(data);
        return this.usersRepository.save(user);
    }
    findById(id) {
        return this.usersRepository.findById(id);
    }
    findByEmail(email) {
        return this.usersRepository.findByEmail(email);
    }
    updateRefreshTokenHash(id, refreshTokenHash) {
        return this.usersRepository.updateRefreshTokenHash(id, refreshTokenHash);
    }
    updateSecurity(id, data) {
        return this.usersRepository.update(id, data);
    }
    async getProfile(id) {
        const user = await this.findExistingUser(id);
        return {
            success: true,
            message: 'Success',
            data: this.toPublicUser(user),
        };
    }
    async updateProfile(id, dto) {
        await this.findExistingUser(id);
        const user = await this.usersRepository.update(id, {
            fullName: dto.fullName?.trim(),
            avatarUrl: dto.avatarUrl?.trim(),
            phoneNumber: dto.phoneNumber?.trim(),
            jobTitle: dto.jobTitle?.trim(),
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return {
            success: true,
            message: 'Profile updated successfully',
            data: this.toPublicUser(user),
        };
    }
    async changePassword(id, dto) {
        const user = await this.findExistingUser(id);
        const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
        if (!isCurrentPasswordValid) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        const passwordHash = await bcrypt.hash(dto.newPassword, this.saltRounds);
        await this.usersRepository.update(id, {
            passwordHash,
            refreshTokenHash: null,
        });
        return {
            success: true,
            message: 'Password changed successfully',
            data: null,
        };
    }
    toPublicUser(user) {
        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            avatarUrl: user.avatarUrl,
            phoneNumber: user.phoneNumber,
            jobTitle: user.jobTitle,
            status: user.status,
            isSystemAdmin: user.isSystemAdmin ?? false,
            mfaEnabled: user.mfaEnabled ?? false,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
    async findExistingUser(id) {
        const user = await this.usersRepository.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repository_1.UsersRepository])
], UsersService);
//# sourceMappingURL=users.service.js.map