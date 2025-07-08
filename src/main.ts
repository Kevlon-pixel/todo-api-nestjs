import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT ?? '3000';

  const config = new DocumentBuilder()
    .setTitle('ToDo')
    .setDescription(
      `Попытка в обучение на todo листе.\n
                    \nУже готово:
                    \nДа ничего пока что.
      `,
    )
    .setVersion('0.1')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(PORT, () =>
    console.log(
      `Started at port ${PORT}, by the link http://localhost:${PORT}/api`,
    ),
  );
}
bootstrap();
