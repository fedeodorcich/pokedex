import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto.js';
import { UpdatePokemonDto } from './dto/update-pokemon.dto.js';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity.js';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel:Model<Pokemon>
  ){}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();

    try{
      const pokemon = await this.pokemonModel.create(createPokemonDto)
      return pokemon;
    }
    catch(error){
       this.handleExceptions(error);
    }   
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
    let pokemon: Pokemon | null = null;

    // 1. Búsqueda por número (si 'term' se puede convertir a número)
    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: +term });
    }

    // 2. Búsqueda por Mongo ID (si no se encontró y es un ID válido de Mongo)
    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
    }

    // 3. Búsqueda por Nombre (si no se encontró en los pasos anteriores)
    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ 
        name: term.toLowerCase().trim() 
      });
    }

    // 4. Excepción si no se encuentra por ninguno de los criterios
    if (!pokemon) {
      throw new NotFoundException(
        `Pokemon con id, nombre o número "${term}" no fue encontrado`
      );
    }

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    
    const pokemon = await this.findOne(term);
    if(updatePokemonDto.name) updatePokemonDto.name = updatePokemonDto.name.toLowerCase();   

    try{
      await pokemon.updateOne(updatePokemonDto,{new:true});
      return {...pokemon.toJSON(), ...updatePokemonDto};
    }
    catch(error){
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
     const {deletedCount} = await this.pokemonModel.deleteOne({_id : id})
     if(deletedCount === 0)throw new BadRequestException("Id de Pokemon no encontrado");
     return;
  }

  private handleExceptions(error:any){
    if(error && typeof error === 'object' && 'code' in error && error.code === 11000){
        throw new BadRequestException('Pokemon exist in db')
      }
      throw new InternalServerErrorException(`Can't create Pokemon - Check server logs`);
  }
}
