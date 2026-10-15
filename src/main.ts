import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { middlewareContextoBusqueda } from './common/contexto-busqueda';
import { ORIGENES_PERMITIDOS } from './common/origenes-permitidos';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ORIGENES_PERMITIDOS,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // si usas cookies o auth
  })
  app.setGlobalPrefix('api');
  // Columnas del buscador (?columnas=) disponibles para FullTextSearchService en toda la request
  app.use(middlewareContextoBusqueda);
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
