import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express'; // Importante importar estos

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Aumentar el límite de peso de los JSON (Evita que se corte la conexión)
  app.use(json({ limit: '100mb' }));
  app.use(urlencoded({ limit: '100mb', extended: true }));

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // 2. Configurar el servidor para que NO cierre la conexión por tiempo (Timeout)
  const server = await app.listen(3000, () => {
    console.log('Backend local en http://localhost:3000');
  });

  // Esto le da tiempo infinito al servidor para terminar de escribir en SQLite
  server.setTimeout(0); 
  server.keepAliveTimeout = 61000; 
}
bootstrap();