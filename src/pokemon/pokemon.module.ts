import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PokemonService } from './pokemon.service';
import { PokemonController } from './pokemon.controller';
import { Pokemon, PokemonSchema } from './entities/pokemon.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  controllers: [PokemonController],
  providers: [PokemonService],
  imports: [ ConfigModule, MongooseModule.forFeature([{ name: Pokemon.name, schema: PokemonSchema }])],//importamos el schema de pokemon
  exports: [MongooseModule],//exportamos el servicio de pokemon y el modulo de mongoose
})
export class PokemonModule {}
