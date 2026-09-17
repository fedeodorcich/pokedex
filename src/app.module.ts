import { Module } from '@nestjs/common';
import { join } from 'path/win32';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PokemonModule } from './pokemon/pokemon.module.js';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from './common/common.module.js';
import { SeedModule } from './seed/seed.module.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvConfiguration } from './config/env.config.js';
import { JoiValidationSchema } from './config/joi.validation.js';

@Module({
  imports: [

    ConfigModule.forRoot({
      load: [EnvConfiguration],
      validationSchema:JoiValidationSchema
    }),
    
    ServeStaticModule.forRoot({ //Sirve para servir archivos estáticos, como imágenes, CSS y JavaScript, desde una carpeta específica en el servidor.
      rootPath: join(import.meta.dirname, '..', 'public'), //sirve para unir rutas de archivos y directorios de manera segura y compatible con diferentes sistemas operativos. En este caso, se está uniendo la ruta del directorio actual (import.meta.dirname) con la carpeta 'public' que se encuentra en el nivel superior del proyecto.
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // Pide 'mongodb' en minúsculas porque así se mapeó en EnvConfiguration
        uri: configService.get<string>('mongodb'), 
        dbName: 'pokemonsdb',
      }),
    }),

    PokemonModule,

    CommonModule,

    SeedModule

  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
