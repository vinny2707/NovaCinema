import { INestApplication } from '@nestjs/common';

export async function setupSwagger(app: INestApplication) {
  if (process.env.NODE_ENV === 'production') return;

  const { SwaggerModule, DocumentBuilder } = await import('@nestjs/swagger');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('NovaCinema API')
    .setDescription('API documentation for NovaCinema')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}
