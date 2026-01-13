import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './bootstrap';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS to allow frontend requests
  app.enableCors({
    origin: true, // for dev
    credentials: true,
  });  
  // app.enableCors({
  //   origin: [
  //     'http://localhost:5173',
  //     'http://localhost:5174',
  //     'http://localhost:3000',
  //   ],
  //   credentials: true,
  //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  //   allowedHeaders: ['Content-Type', 'Authorization'],
  // });

  app.setGlobalPrefix('api', {
    exclude: ['health'],
  });

  await setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
