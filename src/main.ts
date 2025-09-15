import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*', // 🔓 autorise toutes les origines (pour tester)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, clientId, hashParam',
  });

  const config = new DocumentBuilder()
    .setTitle('Wallet API')
    .setDescription('API pour gérer les wallets et factures')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000);
}
void bootstrap(); // dit à ESLint “je sais que je n’attends pas”
