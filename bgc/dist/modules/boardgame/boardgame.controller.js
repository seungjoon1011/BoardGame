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
exports.BoardGameController = void 0;
const common_1 = require("@nestjs/common");
const boardgame_service_1 = require("./boardgame.service");
const bg_dto_1 = require("./dto/bg.dto");
let BoardGameController = class BoardGameController {
    boardGameService;
    constructor(boardGameService) {
        this.boardGameService = boardGameService;
    }
    findAll() {
        return this.boardGameService.findAll();
    }
    create(createBG) {
        return this.boardGameService.create(createBG);
    }
};
exports.BoardGameController = BoardGameController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BoardGameController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bg_dto_1.CreateBG]),
    __metadata("design:returntype", void 0)
], BoardGameController.prototype, "create", null);
exports.BoardGameController = BoardGameController = __decorate([
    (0, common_1.Controller)('boardgame'),
    __metadata("design:paramtypes", [boardgame_service_1.BoardGameService])
], BoardGameController);
//# sourceMappingURL=boardgame.controller.js.map