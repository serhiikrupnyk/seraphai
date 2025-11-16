import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 👇 максимально лояльний CORS (для dev/MVP)
  app.enableCors({
    origin: true, // дозволяємо будь-який Origin (браузер сам підставить конкретний)
    methods: ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 API listening on port ${port}`);
}
bootstrap();
