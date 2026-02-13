import { createApp } from '../src/create-app';

let appPromise: Promise<any> | null = null;

export default async function handler(req: any, res: any) {
  if (!appPromise) {
    appPromise = createApp().then(async (app) => {
      await app.init();
      return app.getHttpAdapter().getInstance();
    });
  }

  const app = await appPromise;
  app(req, res);
}
