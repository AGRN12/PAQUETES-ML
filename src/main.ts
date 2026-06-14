import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express'; // Importante importar estos

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🚀 PERMITIR CONEXIONES DESDE CUALQUIER MÁQUINA DEL CÍBER
  app.enableCors({
    origin: '*', // Permite que tus terminales cliente se conecten sin bloqueos
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 🚀 ESCUCHAR EN TODA LA RED LOCAL
  // Al poner '0.0.0.0', NestJS escuchará tanto a 'localhost' como a tu IP local (ej. 192.168.1.65)
  await app.listen(3000, '0.0.0.0'); 
  
  console.log('🚀 Backend escuchando en el puerto 3000 para toda la red local');
}
bootstrap();