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
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTelegramInitData = verifyTelegramInitData;
const crypto = __importStar(require("crypto"));
function verifyTelegramInitData(initData, botToken, maxAgeSeconds = 86400) {
    try {
        if (!initData) {
            return { ok: false, error: 'Empty initData' };
        }
        const urlParams = new URLSearchParams(initData);
        const hash = urlParams.get('hash');
        const authDate = urlParams.get('auth_date');
        if (!hash || !authDate) {
            return { ok: false, error: 'Missing hash or auth_date' };
        }
        const authTime = parseInt(authDate, 10);
        const now = Math.floor(Date.now() / 1000);
        if (Number.isFinite(authTime) && now - authTime > maxAgeSeconds) {
            return { ok: false, error: 'Auth data is too old' };
        }
        const data = [];
        urlParams.forEach((value, key) => {
            if (key === 'hash')
                return;
            data.push(`${key}=${value}`);
        });
        data.sort();
        const dataCheckString = data.join('\n');
        const secretKey = crypto.createHash('sha256').update(botToken).digest();
        const hmac = crypto
            .createHmac('sha256', secretKey)
            .update(dataCheckString)
            .digest('hex');
        if (hmac !== hash) {
            return { ok: false, error: 'Hash mismatch (invalid initData)' };
        }
        const rawUser = urlParams.get('user');
        if (!rawUser) {
            return { ok: false, error: 'No user field in initData' };
        }
        const user = JSON.parse(rawUser);
        return { ok: true, user };
    }
    catch (e) {
        console.error('verifyTelegramInitData error:', e);
        return { ok: false, error: 'Failed to parse initData' };
    }
}
//# sourceMappingURL=telegram-auth.util.js.map