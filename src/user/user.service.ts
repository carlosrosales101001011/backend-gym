import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { In, Repository } from 'typeorm';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { HashService } from 'src/common/hash.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';
import { v4 as uid } from 'uuid';
@Injectable()
export class UserService {

  constructor (
    @InjectRepository(User)
    private readonly userRepository:Repository<User>,

    @InjectRepository(Terminologia)
    private readonly terminologiaRepository:Repository<Terminologia>,

    private readonly jwtService:JwtService,

    private readonly hashService:HashService,

    private readonly fullTextSearchService: FullTextSearchService
  ){}

  private async getTerminologiaLabels(dto: {
    id_rol?: number;
  }) {
    const ids = [dto.id_rol]
      .filter((id): id is number => id !== undefined && id !== null);

    const labels: Partial<User> = {};
    if (ids.length === 0) return labels;

    const terminologias = await this.terminologiaRepository.findBy({ id: In(ids) });
    const valorPorId = new Map(terminologias.map(t => [t.id, t.valor]));

    if (dto.id_rol !== undefined) labels.label_rol = valorPorId.get(dto.id_rol);

    return labels;
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, uuid, id, ...userData } = createUserDto;

      const passwordHash = await this.hashService.hash(password)
      const labels = await this.getTerminologiaLabels(userData);
      const user = this.userRepository.create({
        ...userData,
        ...labels,
        uuid: uid(),
        password: 'Abc123456'
      });
      console.log('aquii pasa', userData);
      
      await this.userRepository.save(user);
      
      return {
        ...user,
        token: this.getJwtToken({email: user.email})
      };
    } catch (error) {
      console.log(error);
    }
  }

  async login(loginUserDto:LoginUserDto){

    const {password, email} = loginUserDto;

    const user = await this.userRepository.findOne({where: {email}, select: {email: true, password: true, uuid: true}})
    if (!user) {
      throw new UnauthorizedException('Credenciales no validas')
    }
    // const verificarPassword = await this.hashService.compare(password, user.password)
    // if (!verificarPassword) {
    //   throw new UnauthorizedException('Credenciales no validas (password)')
    // }
    return {...user,
      token: this.getJwtToken({email: user.email})
    };
  }

  private getJwtToken(payload:JwtPayload){
    const token = this.jwtService.sign(payload);
    return token;
  }

  async findAll(paginationDto: PaginationDto) {
    const { show, offset } = paginationDto;
    const [lista, total] = await this.userRepository.findAndCount({
        take: show,
        skip: offset,
        order: {
          id: 'ASC'
        },
    })
    return {
      lista,
      total
    }
  }

  async findSearch (  q: string,
    paginationDto: PaginationDto
){
  const { offset, show } = paginationDto;

  if (q.trim().length===0) {
    const [lista, total] = await this.userRepository.findAndCount({
          order: {
            id: 'DESC'
          },
          take: show,
          skip: offset,
        });
    return {
      items: lista,
      total
    }
  }
  const {items, total} =await this.fullTextSearchService.search(
      User,
      [
        'nombres',
        'apellidos',
        'email',
        'email_corporativo',
        'telefono',
        'label_rol'
      ],
      q,
      {
        take: show,
        skip: offset
      }
    );
    return {
      items,
      total
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
