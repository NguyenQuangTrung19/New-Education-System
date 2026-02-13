"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const create_app_1 = require("../src/create-app");
let appPromise = null;
async function handler(req, res) {
    if (!appPromise) {
        appPromise = (0, create_app_1.createApp)().then(async (app) => {
            await app.init();
            return app.getHttpAdapter().getInstance();
        });
    }
    const app = await appPromise;
    app(req, res);
}
//# sourceMappingURL=index.js.map