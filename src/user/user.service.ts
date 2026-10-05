import { BadRequestException, ForbiddenException, HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, In, Repository } from 'typeorm';
import { ModuloXUser } from 'src/modulo-x-user/entities/modulo-x-user.entity';
import { SeccionXModulouser } from 'src/seccion-x-modulouser/entities/seccion-x-modulouser.entity';
import { EntidadXUser } from 'src/entidad-x-user/entities/entidad-x-user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { CambiarPasswordDto } from './dto/cambiar-password.dto';
import { AsignarPasswordDto } from './dto/asignar-password.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { HashService } from 'src/common/hash.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';
import { v4 as uid } from 'uuid';
import { Persona } from 'src/persona/entities/persona.entity';
import { avataresPorPersona } from 'src/persona/avatar-persona';
@Injectable()
export class UserService {
  private readonly logger = new Logger('UserService')

  constructor (
    @InjectRepository(User)
    private readonly userRepository:Repository<User>,

    @InjectRepository(Terminologia)
    private readonly terminologiaRepository:Repository<Terminologia>,

    @InjectRepository(Persona)
    private readonly personaRepository:Repository<Persona>,

    private readonly jwtService:JwtService,

    private readonly hashService:HashService,

    private readonly fullTextSearchService: FullTextSearchService,

    private readonly dataSource: DataSource,
  ){}

  // Los usuarios ya registrados toman el nombre de quien los registró (columna nueva)
  async onModuleInit() {
    try {
      await this.userRepository.query(`
        UPDATE u SET u.label_nombres_apellidos_userParent = LTRIM(RTRIM(CONCAT(p.nombres, ' ', p.apellidos)))
        FROM users u
        INNER JOIN users p ON p.id = u.id_userParent
        WHERE u.label_nombres_apellidos_userParent IS NULL
      `);
    } catch (error) {
      this.logger.error('No se pudo completar el creador de los usuarios', error);
    }
  }

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

  async create(createUserDto: CreateUserDto, idUserParent: number) {
    try {
      const { password, uuid, id, id_userParent, ...userData } = createUserDto;

      // El login es por email o usuario: ninguno de los dos puede repetirse (el email es opcional)
      if (userData.email) {
        const existe = await this.userRepository.exists({ where: { email: userData.email } });
        if (existe) throw new BadRequestException('Ya existe un usuario con ese email');
      }
      const usuarioTomado = await this.userRepository.exists({ where: { usuario: userData.usuario } });
      if (usuarioTomado) throw new BadRequestException('Ese nombre de usuario ya está en uso');

      // Se guarda solo el hash (argon2) de la contraseña enviada
      const passwordHash = await this.hashService.hash(password)
      const labels = await this.getTerminologiaLabels(userData);
      const creador = await this.userRepository.findOne({ where: { id: idUserParent }, select: { id: true, nombres: true, apellidos: true } });
      const user = this.userRepository.create({
        ...userData,
        ...labels,
        id_userParent: idUserParent,
        label_nombres_apellidos_userParent: creador ? `${creador.nombres ?? ''} ${creador.apellidos ?? ''}`.trim() : undefined,
        uuid: uid(),
        password: passwordHash
      });

      await this.userRepository.save(user);

      // La contraseña (ni su hash) nunca vuelve al front
      const { password: _password, ...usuarioCreado } = user;
      return {
        ...usuarioCreado,
        token: this.getJwtToken({uuid: user.uuid})
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(error);
      throw new InternalServerErrorException('No se pudo crear el usuario');
    }
  }

  async login(loginUserDto:LoginUserDto){

    const {password, email} = loginUserDto;

    // Con @ se busca por email; si no, por nombre de usuario
    const identificador = email.trim();
    const donde = identificador.includes('@') ? { email: identificador } : { usuario: identificador };
    const user = await this.userRepository.findOne({where: { ...donde, flag: true }, select: {id: true, email: true, password: true, uuid: true}})
    // Mismo mensaje si no existe el email o si la contraseña no coincide (no se revela cuál falló)
    const credencialesInvalidas = new UnauthorizedException('Credenciales no válidas')
    if (!user) throw credencialesInvalidas

    if (!await this.passwordCoincide(password, user.password)) throw credencialesInvalidas
    // Usuario antiguo con la contraseña sin cifrar: ya que coincide, se guarda cifrada
    if (!this.hashService.esHash(user.password)) {
      await this.userRepository.update(user.id, { password: await this.hashService.hash(password) })
    }

    return {
      email: user.email,
      uuid: user.uuid,
      token: this.getJwtToken({uuid: user.uuid})
    };
  }

  /** Compara con la guardada: hash de argon2, o texto plano en usuarios antiguos */
  private async passwordCoincide(password: string, guardada: string) {
    return this.hashService.esHash(guardada)
      ? await this.hashService.compare(password, guardada)
      : this.hashService.igualesSinCifrar(password, guardada)
  }

  /** Cambia la contraseña del usuario logueado: verifica la actual y guarda el hash de la nueva */
  async cambiarPassword(idUser: number, { password_actual, password_nueva }: CambiarPasswordDto) {
    const user = await this.userRepository.findOne({ where: { id: idUser }, select: { id: true, password: true } })
    if (!user) throw new NotFoundException('Usuario no encontrado')
    if (!await this.passwordCoincide(password_actual, user.password)) {
      throw new BadRequestException('La contraseña actual no es correcta')
    }
    if (password_actual === password_nueva) {
      throw new BadRequestException('La nueva contraseña debe ser distinta a la actual')
    }
    await this.userRepository.update(user.id, { password: await this.hashService.hash(password_nueva) })
    return { ok: true, msg: 'Contraseña actualizada' }
  }

  /**
   * Asigna una contraseña nueva a otro usuario sin pedir la actual.
   * Solo puede quien lo registró (id_userParent) o un super usuario.
   */
  async asignarPassword(idUsuario: number, idAdmin: number, { password_nueva }: AsignarPasswordDto) {
    const [admin, usuario] = await Promise.all([
      this.userRepository.findOne({ where: { id: idAdmin }, select: { id: true, is_super_user: true } }),
      this.userRepository.findOne({ where: { id: idUsuario }, select: { id: true, id_userParent: true } }),
    ])
    if (!usuario) throw new NotFoundException('Usuario no encontrado')
    const puede = !!admin && (admin.is_super_user || usuario.id_userParent === admin.id)
    if (!puede) throw new ForbiddenException('Solo quien registró a este usuario o un super usuario puede cambiar su contraseña')

    await this.userRepository.update(usuario.id, { password: await this.hashService.hash(password_nueva) })
    return { ok: true, msg: 'Contraseña actualizada' }
  }

  private getJwtToken(payload:JwtPayload){
    const token = this.jwtService.sign(payload);
    return token;
  }

  async findAll(paginationDto: PaginationDto) {
    const { show, offset } = paginationDto;
    const [lista, total] = await this.userRepository.findAndCount({
        where: { flag: true },
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
          where: { flag: true },
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
        'usuario',
        'email_corporativo',
        'label_nombres_apellidos_userParent',
        'telefono',
        'label_rol'
      ],
      q,
      {
        take: show,
        skip: offset,
        where: { flag: true }
      }
    );
    return {
      items,
      total
    }
  }

  /** Solo datos para mostrar (nunca la contraseña) */
  async findMe(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: { id: true, nombres: true, apellidos: true, label_rol: true, is_super_user: true, id_empl: true },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    // Foto del usuario: la de su colaborador (users.id_empl → persona)
    const avatares = await avataresPorPersona(this.personaRepository, [user.id_empl]);
    const { id_empl, ...datos } = user;
    return { ...datos, avatar: avatares.get(id_empl) ?? null };
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  /**
   * Elimina (flag = 0) al usuario junto con sus módulos, las secciones de esos módulos y sus permisos por entidad.
   * Solo puede quien lo registró (id_userParent) o un super usuario; nadie a sí mismo.
   */
  async eliminar(idUsuario: number, idAdmin: number) {
    if (idUsuario === idAdmin) throw new ForbiddenException('No puedes eliminarte a ti mismo')
    const [admin, usuario] = await Promise.all([
      this.userRepository.findOne({ where: { id: idAdmin }, select: { id: true, is_super_user: true } }),
      this.userRepository.findOne({ where: { id: idUsuario, flag: true }, select: { id: true, id_userParent: true } }),
    ])
    if (!usuario) throw new NotFoundException('Usuario no encontrado')
    const puede = !!admin && (admin.is_super_user || usuario.id_userParent === admin.id)
    if (!puede) throw new ForbiddenException('Solo quien registró a este usuario o un super usuario puede eliminarlo')

    await this.dataSource.transaction(async (manager) => {
      const modulos = await manager.find(ModuloXUser, { where: { id_user: idUsuario }, select: { id: true } })
      if (modulos.length) {
        await manager.update(SeccionXModulouser, { id_modulouser: In(modulos.map((m) => m.id)) }, { flag: false })
      }
      await manager.update(ModuloXUser, { id_user: idUsuario }, { flag: false })
      await manager.update(EntidadXUser, { id_user: idUsuario }, { flag: false })
      await manager.update(User, { id: idUsuario }, { flag: false })
    })
    return { ok: true, msg: 'Usuario eliminado' }
  }
}
