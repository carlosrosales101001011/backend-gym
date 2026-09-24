import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:5174', 'http://localhost:5173', 'https://frontend-gym-mu.vercel.app/'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // si usas cookies o auth
  })
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
    
  );
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
  console.log(`Servidor ejecutándose en puerto ${process.env.PORT || 3000}`);
}
bootstrap();
