import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { v4 as uidv4 } from 'uuid';
import { CreateModuloXUserDto } from './dto/create-modulo-x-user.dto';
import { UpdateModuloXUserDto } from './dto/update-modulo-x-user.dto';
import { ModuloXUser } from './entities/modulo-x-user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Not, Repository } from 'typeorm';
import { SeccionXModulouser } from 'src/seccion-x-modulouser/entities/seccion-x-modulouser.entity';
import { User } from 'src/user/entities/user.entity';
import { Modulo } from 'src/modulo/entities/modulo.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';
import { AsignarModulosDto } from './dto/asignar-modulos.dto';
import { Seccion } from 'src/seccion/entities/seccion.entity';

/** Módulo de un usuario con las secciones que tiene en él (seccion_x_modulouser activas) */
type ModuloUsuarioConSecciones = Omit<ModuloXUser, 'secciones'> & { secciones: Seccion[] };

/** Datos del usuario que se muestran en la gestión de módulos (nunca la contraseña) */
const CAMPOS_USUARIO = { id: true, uuid: true, nombres: true, apellidos: true, usuario: true, label_rol: true, label_nombres_apellidos_userParent: true } as const;

@Injectable()
export class ModuloXUserService implements OnModuleInit {
  private readonly logger = new Logger('modulo-x-userService')
  constructor(
    @InjectRepository(ModuloXUser)
    private readonly ModuloXUserRepositorio:Repository<ModuloXUser>,
    @InjectRepository(SeccionXModulouser)
    private readonly SeccionXmoduloUserRepository:Repository<SeccionXModulouser>,
    @InjectRepository(User)
    private readonly userRepository:Repository<User>,
    @InjectRepository(Modulo)
    private readonly moduloRepository:Repository<Modulo>,
    @InjectRepository(Seccion)
    private readonly seccionRepository:Repository<Seccion>,
    private readonly fullTextSearchService: FullTextSearchService,
    private readonly dataSource: DataSource,
  ){}

  // Los registros creados antes de existir la columna uid reciben uno al arrancar (solo los que no tienen)
  async onModuleInit() {
    try {
      await this.ModuloXUserRepositorio.query(`UPDATE modulo_x_user SET uid = UPPER(CONVERT(varchar(40), NEWID())) WHERE uid IS NULL`);
    } catch (error) {
      this.logger.error('No se pudo completar el uid de modulo_x_user', error);
    }
  }

  async findAll(iduser:number) {
    console.log({iduser}, 'modulo-x-user.service.ts');
    const modulos =await this.ModuloXUserRepositorio.find({relations: ['modulo'], where: {id_user: iduser, flag: true}});
    console.log(modulos);
    
      return modulos;
  }

  async findBySeccionxModuloUser(iduser:number) {
    console.log({iduser}, 'modulo-x-user.service.ts');
    // const modulos =await this.SeccionXmoduloUserRepository.find({ where: {moduloUser: {id_user: iduser}}, relations: ['moduloUser', 'moduloUser.modulo']});
    const modulos =await this.SeccionXmoduloUserRepository.find({ where: {moduloUser: {id_user: iduser}, flag: true}, relations: {moduloUser: {modulo: true}, seccion: {entidades: true}}});
    console.log({modulos});
    
      return modulos;
  }

  async create(createModuloXUserDto: CreateModuloXUserDto) {
    try {
      const moduloUser = await this.ModuloXUserRepositorio.create({ ...createModuloXUserDto, uid: uidv4().toUpperCase() });
      const modulosUser = await this.ModuloXUserRepositorio.save(moduloUser);
      return modulosUser;
    } catch (error) {
      console.log({error});
    }
  }
  async createBulk(createModuloXUserDto: CreateModuloXUserDto[]) {
    try {
      const moduloUsers = await this.ModuloXUserRepositorio.create(
        createModuloXUserDto.map((dto) => ({ ...dto, uid: uidv4().toUpperCase() }))
      );
      const savedModuloUsers = await this.ModuloXUserRepositorio.save(moduloUsers);
      return savedModuloUsers;
    } catch (error) {
      console.log(error);
      
    }
  }


  // Gestión de módulos por usuario

  /**
   * Ids de los usuarios que puede administrar: el super usuario a todos, los demás a los que registraron.
   * Nunca a sí mismo.
   */
  private async idsAdministrables(idAdmin: number) {
    const admin = await this.userRepository.findOne({ where: { id: idAdmin }, select: { id: true, is_super_user: true } });
    if (!admin) throw new ForbiddenException('Usuario no encontrado');
    const usuarios = await this.userRepository.find({
      where: { id: Not(idAdmin), flag: true, ...(admin.is_super_user ? {} : { id_userParent: idAdmin }) },
      select: { id: true },
    });
    return usuarios.map((usuario) => usuario.id);
  }

  /** Falla si quien administra no puede tocar los módulos de este usuario */
  private async validarAdministrable(idUsuario: number, idAdmin: number) {
    if (idUsuario === idAdmin) throw new ForbiddenException('No puedes cambiar tus propios módulos');
    const usuario = await this.userRepository.findOne({ where: { id: idUsuario, flag: true }, select: { id: true } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    if (!(await this.idsAdministrables(idAdmin)).includes(idUsuario)) {
      throw new ForbiddenException('Solo quien registró a este usuario o un super usuario puede cambiar sus módulos');
    }
  }

  /** Módulos activos de varios usuarios, con su módulo (ícono y nombre) y las secciones activas que tienen en él */
  private async modulosDeUsuarios(idsUsuario: number[]): Promise<ModuloUsuarioConSecciones[]> {
    if (!idsUsuario.length) return [];
    const modulos = await this.ModuloXUserRepositorio.find({
      where: { id_user: In(idsUsuario), flag: true, modulo: { flag: true } },
      relations: { modulo: true },
      order: { id: 'ASC' },
    });
    return this.conSecciones(modulos);
  }

  /** Agrega a cada módulo de usuario sus secciones activas */
  private async conSecciones(modulos: ModuloXUser[]): Promise<ModuloUsuarioConSecciones[]> {
    if (!modulos.length) return [];
    // Aparte: filtrar por la relación dejaría fuera a los módulos sin secciones
    const secciones = await this.SeccionXmoduloUserRepository.find({
      where: { id_modulouser: In(modulos.map((m) => m.id)), flag: true, seccion: { flag: true } },
      relations: { seccion: true },
      order: { id: 'ASC' },
    });
    return modulos.map((m) => ({
      ...m,
      secciones: secciones.filter((s) => s.id_modulouser === m.id).map((s) => s.seccion as Seccion),
    }));
  }

  /** Tabla: usuarios que puede administrar (con búsqueda y paginación), cada uno con sus módulos */
  async buscarUsuarios(idAdmin: number, { q = '', show, offset }: PaginationDto) {
    const ids = await this.idsAdministrables(idAdmin);
    if (!ids.length) return { items: [], total: 0 };

    let usuarios: User[];
    let total: number;
    if (q.trim().length === 0) {
      [usuarios, total] = await this.userRepository.findAndCount({
        where: { id: In(ids) }, select: CAMPOS_USUARIO, order: { id: 'DESC' }, take: show, skip: offset,
      });
    } else {
      const resultado = await this.fullTextSearchService.search(
        User,
        ['nombres', 'apellidos', 'usuario', 'label_rol', 'label_nombres_apellidos_userParent'],
        q,
        { take: show, skip: offset, where: { id: ids } },
      );
      // El buscador trae todas las columnas (también la contraseña): se deja solo lo que se muestra
      usuarios = resultado.items.map((u: User) => Object.fromEntries(Object.keys(CAMPOS_USUARIO).map((k) => [k, u[k]])) as User);
      total = resultado.total;
    }

    const modulos = await this.modulosDeUsuarios(usuarios.map((usuario) => usuario.id));
    return {
      items: usuarios.map((usuario) => ({ ...usuario, modulos: modulos.filter((m) => m.id_user === usuario.id) })),
      total,
    };
  }

  /** Select del modal: usuarios que puede administrar */
  async opcionesUsuarios(idAdmin: number) {
    const ids = await this.idsAdministrables(idAdmin);
    if (!ids.length) return [];
    return this.userRepository.find({ where: { id: In(ids) }, select: CAMPOS_USUARIO, order: { nombres: 'ASC', apellidos: 'ASC' } });
  }

  /**
   * "Mis módulos": los que puede asignar (el super usuario, todos los del catálogo), cada uno con las
   * secciones que tiene en él quien administra (vacío si no tiene ese módulo).
   */
  async modulosDisponibles(idAdmin: number): Promise<(Modulo & { secciones: Seccion[] })[]> {
    const admin = await this.userRepository.findOne({ where: { id: idAdmin }, select: { id: true, is_super_user: true } });
    if (!admin) throw new ForbiddenException('Usuario no encontrado');
    const propios = await this.modulosDeUsuarios([idAdmin]);
    // Secciones por módulo, sin repetir (por si tiene el mismo módulo dos veces)
    const seccionesPorModulo = new Map<number, Map<number, Seccion>>();
    for (const m of propios) {
      const secciones = seccionesPorModulo.get(m.id_modulo!) ?? new Map<number, Seccion>();
      m.secciones.forEach((s) => secciones.set(s.id!, s));
      seccionesPorModulo.set(m.id_modulo!, secciones);
    }
    const modulos = admin.is_super_user
      ? await this.moduloRepository.find({ where: { flag: true } })
      : [...new Map(propios.map((m) => [m.id_modulo, m.modulo as Modulo])).values()];
    return modulos
      .map((m) => ({ ...m, secciones: [...(seccionesPorModulo.get(m.id!)?.values() ?? [])] }))
      .sort((a, b) => (a.label ?? '').localeCompare(b.label ?? ''));
  }

  /** Módulos activos de un usuario (para abrir el modal) */
  async modulosDeUsuario(idUsuario: number, idAdmin: number) {
    await this.validarAdministrable(idUsuario, idAdmin);
    return this.modulosDeUsuarios([idUsuario]);
  }

  /**
   * Deja al usuario con los módulos enviados: crea los nuevos, reactiva los que se le habían quitado
   * (mismo registro), actualiza fijado/favorito y quita (flag = 0) los que ya no vienen.
   * Solo toca los módulos que quien administra puede asignar; los demás del usuario quedan como están.
   * Secciones: en cada módulo que trae ids_seccion se dejan esas (crea, reactiva o quita con flag = 0),
   * solo entre las secciones que quien administra tiene en ese módulo. Los módulos quitados conservan las suyas.
   */
  async asignarModulos(idUsuario: number, idAdmin: number, { modulos }: AsignarModulosDto) {
    await this.validarAdministrable(idUsuario, idAdmin);
    const disponibles = await this.modulosDisponibles(idAdmin);
    const idsPermitidos = new Set(disponibles.map((m) => m.id!));
    const noPermitidos = modulos.filter((m) => !idsPermitidos.has(m.id_modulo));
    if (noPermitidos.length) {
      throw new BadRequestException(`No puedes asignar módulos que no tienes (id: ${noPermitidos.map((m) => m.id_modulo).join(', ')})`);
    }
    // Secciones que puede dar en cada módulo: las suyas
    const seccionesPermitidas = new Map(disponibles.map((m) => [m.id!, new Set(m.secciones.map((sec) => sec.id!))]));
    for (const { id_modulo, ids_seccion = [] } of modulos) {
      const ajenas = ids_seccion.filter((id) => !seccionesPermitidas.get(id_modulo)?.has(id));
      if (ajenas.length) {
        throw new BadRequestException(`No puedes dar secciones que no tienes en el módulo ${id_modulo} (id: ${ajenas.join(', ')})`);
      }
    }

    await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(ModuloXUser);
      const existentes = idsPermitidos.size === 0 ? [] : await repo.find({
        where: { id_user: idUsuario, id_modulo: In([...idsPermitidos]) },
        // flag no se trae por defecto: hace falta para reactivar los quitados
        select: { id: true, id_modulo: true, flag: true },
        order: { id: 'ASC' },
      });
      // Si hay varios registros del mismo módulo se usa el activo, si no el primero
      const porModulo = new Map<number, ModuloXUser>();
      for (const fila of existentes) {
        const actual = porModulo.get(fila.id_modulo!);
        if (!actual || (!actual.flag && fila.flag)) porModulo.set(fila.id_modulo!, fila);
      }

      const pedidos = new Set(modulos.map((m) => m.id_modulo));
      for (const { id_modulo, is_fijado, is_favorito, ids_seccion } of modulos) {
        const fila = porModulo.get(id_modulo);
        let idModuloUser = fila?.id;
        if (fila) await repo.update(fila.id!, { flag: true, is_fijado, is_favorito });
        else {
          const { identifiers } = await repo.insert({ id_user: idUsuario, id_modulo, is_fijado, is_favorito, flag: true, uid: uidv4().toUpperCase() });
          idModuloUser = identifiers[0].id;
        }
        if (ids_seccion) {
          await this.sincronizarSecciones(manager.getRepository(SeccionXModulouser), idModuloUser!, ids_seccion, seccionesPermitidas.get(id_modulo)!);
        }
      }
      const quitar = existentes.filter((fila) => fila.flag && !pedidos.has(fila.id_modulo!)).map((fila) => fila.id!);
      if (quitar.length) await repo.update({ id: In(quitar) }, { flag: false });
    });

    return this.modulosDeUsuarios([idUsuario]);
  }

  /**
   * Deja en un módulo del usuario las secciones pedidas: crea las nuevas, reactiva las quitadas (mismo
   * registro) y quita (flag = 0) las que ya no vienen. Solo entre las permitidas; las demás no se tocan.
   */
  private async sincronizarSecciones(repo: Repository<SeccionXModulouser>, idModuloUser: number, idsSeccion: number[], permitidas: Set<number>) {
    if (!permitidas.size) return;
    const existentes = await repo.find({
      where: { id_modulouser: idModuloUser, id_seccion: In([...permitidas]) },
      select: { id: true, id_seccion: true, flag: true },
      order: { id: 'ASC' },
    });
    const porSeccion = new Map<number, SeccionXModulouser>();
    for (const fila of existentes) {
      const actual = porSeccion.get(fila.id_seccion!);
      if (!actual || (!actual.flag && fila.flag)) porSeccion.set(fila.id_seccion!, fila);
    }

    const pedidas = new Set(idsSeccion);
    for (const id_seccion of idsSeccion) {
      const fila = porSeccion.get(id_seccion);
      if (!fila) await repo.insert({ id_modulouser: idModuloUser, id_seccion, flag: true });
      else if (!fila.flag) await repo.update(fila.id!, { flag: true });
    }
    const quitar = existentes.filter((fila) => fila.flag && !pedidas.has(fila.id_seccion!)).map((fila) => fila.id!);
    if (quitar.length) await repo.update({ id: In(quitar) }, { flag: false });
  }

  // Gestión de secciones por módulo de usuario (página seccion-x-modulouser)

  /**
   * Secciones que quien administra puede dar en un módulo: el super usuario, todas las del catálogo;
   * los demás, las que ellos tienen en ese módulo.
   */
  private async seccionesPermitidas(idAdmin: number, idModulo: number): Promise<Set<number>> {
    const admin = await this.userRepository.findOne({ where: { id: idAdmin }, select: { id: true, is_super_user: true } });
    if (admin?.is_super_user) {
      const todas = await this.seccionRepository.find({ where: { flag: true }, select: { id: true } });
      return new Set(todas.map((sec) => sec.id!));
    }
    const mio = (await this.modulosDisponibles(idAdmin)).find((m) => m.id === idModulo);
    return new Set((mio?.secciones ?? []).map((sec) => sec.id!));
  }

  /** Módulo del usuario activo y que quien administra puede tocar */
  private async moduloUsuarioAdministrable(idModuloUser: number, idAdmin: number) {
    const moduloUser = await this.ModuloXUserRepositorio.findOne({ where: { id: idModuloUser, flag: true }, relations: { modulo: true } });
    if (!moduloUser) throw new NotFoundException('Módulo del usuario no encontrado');
    await this.validarAdministrable(moduloUser.id_user!, idAdmin);
    return moduloUser;
  }

  /**
   * Para el modal de secciones: el módulo del usuario (con sus secciones y el usuario), el catálogo de
   * secciones y cuáles puede dar quien administra.
   */
  async detalleSeccionesModuloUsuario(idModuloUser: number, idAdmin: number) {
    const moduloUser = await this.moduloUsuarioAdministrable(idModuloUser, idAdmin);
    const [[conSec], usuario, catalogo, permitidas] = await Promise.all([
      this.conSecciones([moduloUser]),
      this.userRepository.findOne({ where: { id: moduloUser.id_user }, select: CAMPOS_USUARIO }),
      this.seccionRepository.find({ where: { flag: true }, order: { label: 'ASC' } }),
      this.seccionesPermitidas(idAdmin, moduloUser.id_modulo!),
    ]);
    return { moduloUsuario: { ...conSec, usuario }, catalogo, idsPermitidas: [...permitidas] };
  }

  /**
   * Deja en un módulo del usuario las secciones enviadas (solo entre las que puede dar quien administra;
   * las demás quedan como están). Quitar = flag 0; volver a dar = reactivar el mismo registro.
   */
  async asignarSeccionesModuloUsuario(idModuloUser: number, idAdmin: number, idsSeccion: number[]) {
    const moduloUser = await this.moduloUsuarioAdministrable(idModuloUser, idAdmin);
    const permitidas = await this.seccionesPermitidas(idAdmin, moduloUser.id_modulo!);
    const ajenas = idsSeccion.filter((id) => !permitidas.has(id));
    if (ajenas.length) throw new BadRequestException(`No puedes dar secciones que no tienes en este módulo (id: ${ajenas.join(', ')})`);

    await this.dataSource.transaction((manager) =>
      this.sincronizarSecciones(manager.getRepository(SeccionXModulouser), moduloUser.id!, idsSeccion, permitidas));
    const [actualizado] = await this.conSecciones([moduloUser]);
    return actualizado;
  }
}
