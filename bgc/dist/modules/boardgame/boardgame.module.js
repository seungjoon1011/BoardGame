"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoardGameModule = void 0;
const typeorm_1 = require("@nestjs/typeorm");
const boardgame_entity_1 = require("./entity/boardgame.entity");
const common_1 = require("@nestjs/common");
const boardgame_controller_1 = require("./boardgame.controller");
const boardgame_service_1 = require("./boardgame.service");
let BoardGameModule = class BoardGameModule {
};
exports.BoardGameModule = BoardGameModule;
exports.BoardGameModule = BoardGameModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([boardgame_entity_1.BoardGame])],
        controllers: [boardgame_controller_1.BoardGameController],
        providers: [boardgame_service_1.BoardGameService],
    })
], BoardGameModule);
//# sourceMappingURL=boardgame.module.js.map