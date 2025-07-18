import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { JwtGuard } from './auth/jwt.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT ?? '3000';

  const config = new DocumentBuilder()
    .setTitle('ToDo')
    .setDescription('описание')
    .setVersion('0.2')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Введите строку: Bearer <JWT>',
      },
      'bearerAuth',
    )
    .build();
  const document = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(PORT, () =>
    console.log(
      `Started at port ${PORT}, by the link http://localhost:${PORT}/api`,
    ),
  );
}
bootstrap();
