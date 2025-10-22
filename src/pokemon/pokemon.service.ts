import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {

  private defaultLimit: number; 
  
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService,
  ) {
    this.defaultLimit = Number(this.configService.get('defaultLimit'));
  }
  
  /**
   * Crea un nuevo Pokémon en la base de datos.
   *
   * - Valida y transforma los datos recibidos desde `CreatePokemonDto`.
   * - Persiste el Pokémon y devuelve la entidad creada.
   *
   * @param createPokemonDto Datos necesarios para crear el Pokémon.
   * @returns El Pokémon creado o lanza un error si falla la creación.
   */
  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    try {
        const pokemon = await this.pokemonModel.create(createPokemonDto);
        return pokemon;
    } catch (error) {
        this.handleExceptions(error);
    }
  }
  
  /**
   * Obtiene todos los Pokémon registrados.
   *
   * - Retorna una consulta de Mongoose encadenable (`limit`, `skip`, `sort`).
   * - Úsalo directamente o aplícale paginación/ordenamiento según sea necesario.
   *
   * @returns Consulta de Mongoose para listar Pokémon.
   */
  findAll(paginationDto: PaginationDto) {
    const { limit = this.defaultLimit, offset = 0 } = paginationDto;
    return this.pokemonModel.find().limit(limit).skip(offset).sort({ no: 1 });
  }
  
  /**
   * Busca un Pokémon usando un término flexible (número o nombre).
   *
   * - Si el término es numérico, consulta por el campo `no`.
   * - Si es texto, consulta por `name` en minúsculas.
   * - Lanza `NotFoundException` si no se encuentra el recurso.
   *
   * @param term Número del Pokédex o nombre del Pokémon.
   * @returns El Pokémon encontrado.
   * @throws NotFoundException cuando no existe un Pokémon con el término dado.
   */
  async findOne(term: string): Promise<Pokemon> {
    let pokemon: Pokemon | null = null;

    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: +term });
    }
    // Mongo ID
    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
    }
    // Name
    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: term.toLocaleLowerCase() });
    }

    if (!pokemon) {
      throw new NotFoundException(`Pokemon con término "${term}" no encontrado`);
    }

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    /**
     * Actualiza un Pokémon existente.
     *
     * - Localiza el Pokémon usando `term` (id, número o nombre).
     * - Normaliza el nombre a minúsculas si viene en el DTO.
     * - Aplica los cambios y retorna la mezcla del documento original con los campos actualizados.
     *
     * @param term Identificador flexible: id de Mongo, número (`no`) o nombre.
     * @param updatePokemonDto Datos a actualizar del Pokémon.
     * @returns El Pokémon actualizado (datos combinados).
     * @throws NotFoundException si no existe el Pokémon.
     */
    const pokemon = await this.findOne(term);
    if (updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
    }

    try {
       await pokemon.updateOne(updatePokemonDto, { new: true });
        return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExceptions(error);
    } 
  }

  /**
   * Elimina un Pokémon por su id de Mongo.
   *
   * - Ejecuta `deleteOne` con el `_id` recibido.
   * - Lanza `NotFoundException` si no se elimina ningún documento.
   *
   * @param _id Identificador de Mongo del Pokémon a eliminar.
   * @returns Objeto con el mensaje de eliminación exitosa.
   * @throws NotFoundException cuando el id no existe.
   */
  async remove(_id: string) {
   
      const {deletedCount} = await this.pokemonModel.deleteOne({_id}); 
      if (deletedCount === 0) {
        throw new NotFoundException(`Pokemon con id "${_id}" no encontrado`);
      }
      return { message: "Pokemon eliminado" };
  }

  /**
   * Maneja excepciones de base de datos y transforma errores en HTTP.
   *
   * - Si el error es por duplicado (`code === 11000`), lanza `BadRequestException`.
   * - Para otros errores, registra en consola y lanza `InternalServerErrorException`.
   *
   * @param error Error capturado desde operaciones Mongoose.
   * @throws BadRequestException para claves duplicadas.
   * @throws InternalServerErrorException para errores no controlados.
   */
  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(`Pokemon already exists in db ${JSON.stringify(error.keyValue)}`);
    }
    console.log(error);
    throw new InternalServerErrorException(`Problemas con actualizar el pokemon - Chequear los logs`);
  }
}
