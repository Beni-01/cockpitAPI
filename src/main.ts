import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';


import helmet from 'helmet';

import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';

import { WsAdapter } from '@nestjs/platform-ws';

import { NestExpressApplication } from '@nestjs/platform-express';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
   
  app.set('trust proxy', true);
  
  // Utilisation du middleware helmet pour renforcer la sécurité
  app.use(helmet());
  
  //app.useGlobalMiddleware(new RequestContextMiddleware());
  
  // Configuration des pipes de validation pour transformer et sécuriser les requêtes
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));


  app.enableCors();

  // // CORS: Configuration des origines autorisées et des en-têtes exposés pour CSRF
  // app.enableCors({
  //   origin: ['http://10.140.0.106:4204', 'http://localhost:4204', 'http://localhost:3000'], // Liste des origines autorisées
  //   // allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'], // En-têtes autorisés dans les requêtes
  //   // exposedHeaders: ['x-csrf-token'], // En-têtes à exposer au client (incluant le token CSRF)
  //   // credentials: true, // Autorise l'envoi de cookies (nécessaire pour CSRF)
  // });

  // Middleware pour l'analyse des cookies
  app.use(cookieParser());

  // Adapter la taille maximale des en-têtes HTTP
  app.getHttpAdapter().getInstance().set('maxHttpHeaderSize', 100 * 1024 * 1024);

  // Body parsers pour gérer les requêtes volumineuses
  app.use(bodyParser.json({ limit: '100mb' }));
  app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

  // Récupération de la configuration du port via ConfigService
 
  const port = configService.get('PORT') || 3000;

  // Configuration de la documentation Swagger
  const config = new DocumentBuilder()
    .setTitle('Fonarev 360')
    .setDescription('API')
    .setVersion('1.0')
    .addTag('F360')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1', app, document);

  // Configuration du niveau de journalisation
//  app.useLogger(['error', 'warn', 'log', 'debug', 'verbose']); // Choisissez les niveaux de journalisation que vous souhaitez

  // Utilisation de l'adaptateur WebSocket pour les notifications en temps réel
  app.useWebSocketAdapter(new WsAdapter(app));

  // Ajout de l'intercepteur CSRF pour gérer le token dans les réponses
  // app.useGlobalInterceptors(new CsrfInterceptor());

  await app.listen(port, () => {
    console.log(`L'application fonctionne sur le port ${port}`);
  });
}

bootstrap();
