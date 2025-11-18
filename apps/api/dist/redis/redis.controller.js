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
exports.RedisTestController = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("./redis.service");
let RedisTestController = class RedisTestController {
    redis;
    constructor(redis) {
        this.redis = redis;
    }
    async check() {
        await this.redis.set('hello', 'world', 60);
        const value = await this.redis.get('hello');
        return { ok: true, value };
    }
};
exports.RedisTestController = RedisTestController;
__decorate([
    (0, common_1.Get)('check'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RedisTestController.prototype, "check", null);
exports.RedisTestController = RedisTestController = __decorate([
    (0, common_1.Controller)('redis-test'),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], RedisTestController);
//# sourceMappingURL=redis.controller.js.map