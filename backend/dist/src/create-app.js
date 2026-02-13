"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function createApp() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    return app;
}
//# sourceMappingURL=create-app.js.map