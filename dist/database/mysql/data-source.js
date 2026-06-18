"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const typeorm_1 = require("typeorm");
const database_config_1 = require("../../config/database.config");
exports.default = new typeorm_1.DataSource((0, database_config_1.mysqlConfig)());
//# sourceMappingURL=data-source.js.map