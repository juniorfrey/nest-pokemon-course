import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';
import { url } from 'inspector';

@Injectable()
export class SeedService {
  private readonly axios: AxiosInstance = axios;

  async executeSeed() {
    const { data } = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=10', );
    data.results.forEach(({ name, url }) => {
      console.log({name, url});
      //const id = Number(url.split('/')[6]);
      const segment = url.split('/');
      const no = +segment[segment.length - 2];
      console.log({name, no, });
      //await this.axios.post('http://localhost:3000/pokemon', { name, url });
    });
    return data.results;
  }
}
