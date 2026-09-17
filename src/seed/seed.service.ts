import { BadRequestException, Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface.js';
import { Model } from 'mongoose';
import { Pokemon } from '../pokemon/entities/pokemon.entity.js';
import { InjectModel } from '@nestjs/mongoose';
import { AxiosAdapter } from '../common/adapters/axios.adapter.js';

@Injectable()
export class SeedService {
   
   constructor(
       @InjectModel(Pokemon.name)
       private readonly pokemonModel:Model<Pokemon>,
       private readonly http:AxiosAdapter,
     ){}

   async executeSeed(){

      await this.pokemonModel.deleteMany({});

      const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=151');

      const pokemons = data.results.map(({name,url})=>{
         const segments = url.split('/');
         const no = +segments[segments.length - 2 ];
         return {name,no}
      })

      try{
        const pokemon = await this.pokemonModel.insertMany(pokemons)
        return pokemon;
      }
      catch(error){
        throw new BadRequestException('Problema al obtener data')
      } 
   }
}
