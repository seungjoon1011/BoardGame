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
exports.preferredBoardGame = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const boardgame_entity_1 = require("../../boardgame/entity/boardgame.entity");
let preferredBoardGame = class preferredBoardGame {
    id;
    user;
    boardgame;
};
exports.preferredBoardGame = preferredBoardGame;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], preferredBoardGame.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    __metadata("design:type", user_entity_1.User)
], preferredBoardGame.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => boardgame_entity_1.BoardGame),
    __metadata("design:type", boardgame_entity_1.BoardGame)
], preferredBoardGame.prototype, "boardgame", void 0);
exports.preferredBoardGame = preferredBoardGame = __decorate([
    (0, typeorm_1.Entity)()
], preferredBoardGame);
//# sourceMappingURL=preferredBG.entity.js.map