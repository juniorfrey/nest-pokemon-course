import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';


@Injectable()
export class SeedService {
  
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter,
  ) {}

  async executeSeed() {
    await this.pokemonModel.deleteMany({});
    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650', );

    //const insertPromisesArray: Promise<any>[] = [];
    const pokemonToInsert: {name: string, no: number}[] = [];

    data.results.forEach(async ({ name, url }) => {
      console.log({name, url});
      //const id = Number(url.split('/')[6]);
      const segment = url.split('/');
      const no = +segment[segment.length - 2];
      //insertPromisesArray.push(this.pokemonModel.create({ name, no }));
      pokemonToInsert.push({name, no});
    });
    //await Promise.all(insertPromisesArray);
    await this.pokemonModel.insertMany(pokemonToInsert);
    return'Se insertaton correctamente';
  }
}
