"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const create_app_1 = require("../src/create-app");
let appPromise = null;
async function handler(req, res) {
    try {
        if (!appPromise) {
            console.log('Initializing NestJS App...');
            appPromise = (0, create_app_1.createApp)().then(async (app) => {
                await app.init();
                console.log('NestJS App Initialized');
                return app.getHttpAdapter().getInstance();
            }).catch(err => {
                console.error('App Initialization Failed:', err);
                throw err;
            });
        }
        const app = await appPromise;
        app(req, res);
    }
    catch (err) {
        console.error('Serverless Handler Error:', err);
        res.status(500).json({
            statusCode: 500,
            message: 'Internal Server Error',
            error: err instanceof Error ? err.message : String(err)
        });
    }
}
//# sourceMappingURL=index.js.map