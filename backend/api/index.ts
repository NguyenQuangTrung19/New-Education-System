import { createApp } from '../src/create-app';

let appPromise: Promise<any> | null = null;

export default async function handler(req: any, res: any) {
  try {
    if (!appPromise) {
      console.log('Initializing NestJS App...');
      appPromise = createApp().then(async (app) => {
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
  } catch (err) {
    console.error('Serverless Handler Error:', err);
    res.status(500).json({ 
      statusCode: 500, 
      message: 'Internal Server Error', 
      error: err instanceof Error ? err.message : String(err) 
    });
  }
}
