import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
ValidationPipe;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    })
  );

  const config = new DocumentBuilder()
    .setTitle('API de Reservas - Universidad')
    .setDescription('Documentación oficial de los endpoints para el sistema de reservas y gestión de salones.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector))
  )
  
  const port = process.env.PORT ?? 3000;

  await app.listen(port);
  printBanner(port);
}

function printBanner(
  port: string | number
) {
  const reset = '\x1b[0m';
  const green = '\x1b[32m';
  const yellow = '\x1b[33m';
  const cyan = '\x1b[36m';
  const magenta = '\x1b[35m';
  const gray = '\x1b[90m';
  const bold = '\x1b[1m';

  const timestamp = new Date().toLocaleString('es-ES', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
  });

  const header = `${green}[Quizzy]${reset} ${gray}- ${reset}${timestamp}    ${green}LOG ${reset}${yellow}[Bootstrap]${reset}`;
  const line = `${green}================================================================${reset}`;

  console.log(`${header} ${line}`);
  console.log(`${header} 🚀 ${bold}App running at:${reset}     ${yellow}http://localhost:${port}${reset}`);
  console.log(`${header} 🌐 ${bold}CORS enabled:${reset}            ${green}true${reset}`);
  console.log(`${header} ${line}`);
}
bootstrap();
