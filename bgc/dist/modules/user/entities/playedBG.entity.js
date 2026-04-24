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
exports.playedBoardGame = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const boardgame_entity_1 = require("../../boardgame/entity/boardgame.entity");
let playedBoardGame = class playedBoardGame {
    id;
    user;
    boardgame;
};
exports.playedBoardGame = playedBoardGame;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], playedBoardGame.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    __metadata("design:type", user_entity_1.User)
], playedBoardGame.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => boardgame_entity_1.BoardGame),
    __metadata("design:type", boardgame_entity_1.BoardGame)
], playedBoardGame.prototype, "boardgame", void 0);
exports.playedBoardGame = playedBoardGame = __decorate([
    (0, typeorm_1.Entity)()
], playedBoardGame);
//# sourceMappingURL=playedBG.entity.js.map