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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var OtpService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpService = exports.OTP_MAX_ATTEMPTS = exports.OTP_RESEND_COOLDOWN_SECONDS = exports.OTP_TTL_SECONDS = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const ioredis_1 = __importDefault(require("ioredis"));
const bcrypt = __importStar(require("bcrypt"));
const redis_constants_1 = require("../../../database/redis/redis.constants");
exports.OTP_TTL_SECONDS = 600;
exports.OTP_RESEND_COOLDOWN_SECONDS = 60;
exports.OTP_MAX_ATTEMPTS = 5;
const OTP_SALT_ROUNDS = 10;
let OtpService = OtpService_1 = class OtpService {
    redis;
    logger = new common_1.Logger(OtpService_1.name);
    constructor(redis) {
        this.redis = redis;
    }
    generateOtp() {
        return String((0, crypto_1.randomInt)(0, 1_000_000)).padStart(6, '0');
    }
    async savePendingRegistration(registration, otp) {
        const otpHash = await bcrypt.hash(otp, OTP_SALT_ROUNDS);
        const payload = {
            ...registration,
            otpHash,
            attempts: 0,
            createdAt: Date.now(),
        };
        await this.redis.set(this.registrationKey(registration.email), JSON.stringify(payload), 'EX', exports.OTP_TTL_SECONDS);
        await this.redis.set(this.cooldownKey(registration.email), '1', 'EX', exports.OTP_RESEND_COOLDOWN_SECONDS);
    }
    async getPendingRegistration(email) {
        const raw = await this.redis.get(this.registrationKey(email));
        if (!raw) {
            return null;
        }
        try {
            return JSON.parse(raw);
        }
        catch {
            await this.redis.del(this.registrationKey(email));
            return null;
        }
    }
    async getResendCooldownSeconds(email) {
        const ttl = await this.redis.ttl(this.cooldownKey(email));
        return ttl > 0 ? ttl : 0;
    }
    async verifyOtp(email, otp) {
        const stored = await this.getPendingRegistration(email);
        if (!stored) {
            return { status: 'NOT_FOUND' };
        }
        if (stored.attempts >= exports.OTP_MAX_ATTEMPTS) {
            await this.clearPendingRegistration(email);
            return { status: 'TOO_MANY_ATTEMPTS' };
        }
        const isValid = await bcrypt.compare(otp, stored.otpHash);
        if (isValid) {
            return {
                status: 'OK',
                registration: {
                    email: stored.email,
                    fullName: stored.fullName,
                    passwordHash: stored.passwordHash,
                },
            };
        }
        const attempts = stored.attempts + 1;
        if (attempts >= exports.OTP_MAX_ATTEMPTS) {
            await this.clearPendingRegistration(email);
            return { status: 'TOO_MANY_ATTEMPTS' };
        }
        const remainingTtl = await this.redis.ttl(this.registrationKey(email));
        await this.redis.set(this.registrationKey(email), JSON.stringify({ ...stored, attempts }), 'EX', remainingTtl > 0 ? remainingTtl : exports.OTP_TTL_SECONDS);
        return {
            status: 'INVALID',
            remainingAttempts: exports.OTP_MAX_ATTEMPTS - attempts,
        };
    }
    async refreshOtp(email, otp) {
        const stored = await this.getPendingRegistration(email);
        if (!stored) {
            return false;
        }
        await this.savePendingRegistration({
            email: stored.email,
            fullName: stored.fullName,
            passwordHash: stored.passwordHash,
        }, otp);
        return true;
    }
    async clearPendingRegistration(email) {
        await this.redis.del(this.registrationKey(email));
    }
    async saveSecurityChallenge(purpose, email, otp, data = {}) {
        const otpHash = await bcrypt.hash(otp, OTP_SALT_ROUNDS);
        await this.redis.set(`auth:${purpose}:otp:${email.toLowerCase()}`, JSON.stringify({ otpHash, attempts: 0, data }), 'EX', exports.OTP_TTL_SECONDS);
    }
    async verifySecurityChallenge(purpose, email, otp) {
        const key = `auth:${purpose}:otp:${email.toLowerCase()}`;
        const raw = await this.redis.get(key);
        if (!raw)
            return { status: 'NOT_FOUND' };
        const stored = JSON.parse(raw);
        if (stored.attempts >= exports.OTP_MAX_ATTEMPTS) {
            await this.redis.del(key);
            return { status: 'TOO_MANY_ATTEMPTS' };
        }
        if (await bcrypt.compare(otp, stored.otpHash)) {
            await this.redis.del(key);
            return { status: 'OK', data: stored.data };
        }
        stored.attempts += 1;
        const ttl = await this.redis.ttl(key);
        if (stored.attempts >= exports.OTP_MAX_ATTEMPTS) {
            await this.redis.del(key);
            return { status: 'TOO_MANY_ATTEMPTS' };
        }
        await this.redis.set(key, JSON.stringify(stored), 'EX', Math.max(1, ttl));
        return { status: 'INVALID', remainingAttempts: exports.OTP_MAX_ATTEMPTS - stored.attempts };
    }
    registrationKey(email) {
        return `auth:register:otp:${email.toLowerCase()}`;
    }
    cooldownKey(email) {
        return `auth:register:otp-cooldown:${email.toLowerCase()}`;
    }
};
exports.OtpService = OtpService;
exports.OtpService = OtpService = OtpService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(redis_constants_1.REDIS_CLIENT)),
    __metadata("design:paramtypes", [ioredis_1.default])
], OtpService);
//# sourceMappingURL=otp.service.js.map