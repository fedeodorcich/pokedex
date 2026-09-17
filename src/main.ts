import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v2');

  app.useGlobalPipes(
    new ValidationPipe({ // valida lo que se recibe antes de utilziarse
      whitelist:true,
      forbidNonWhitelisted:true,
      transform:true,
      transformOptions:{
        enableImplicitConversion:true
      }
    })
  );

  const port = process.env.PORT ?? 3000;

  // 2. Escuchar en '0.0.0.0' para que Render detecte la aplicación
  await app.listen(port, '0.0.0.0');
}
await bootstrap();
