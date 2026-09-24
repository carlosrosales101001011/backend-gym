import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerminologiaModule } from './terminologia/terminologia.module';
import { UserModule } from './user/user.module';
import { ContactoEmergenciaModule } from './contacto-emergencia/contacto-emergencia.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './common/task.service';
import { UserSubscriber } from './user/subscriber/user.subscriber';
import { SeccionModule } from './seccion/seccion.module';
import { UsuarioPermisosModule } from './usuario-permisos/usuario-permisos.module';
import { SeccionXEntidadModule } from './seccion-x-entidad/seccion-x-entidad.module';
import { ModuloXUserModule } from './modulo-x-user/modulo-x-user.module';
import { ModuloModule } from './modulo/modulo.module';
import { EntidadXUserModule } from './entidad-x-user/entidad-x-user.module';
import { SeccionXModulouserModule } from './seccion-x-modulouser/seccion-x-modulouser.module';
import { ContratoEmpleadoModule } from './contrato-empleado/contrato-empleado.module';
import { ComentarioModule } from './comentario/comentario.module';
import { DiasLaborablesModule } from './dias-laborables/dias-laborables.module';
import { HorariosespecialesLaborablesModule } from './horariosespeciales-laborables/horariosespeciales-laborables.module';
import { MarcacionModule } from './marcacion/marcacion.module';
import { TipoCambioModule } from './tipo-cambio/tipo-cambio.module';
import { MovimientoFinancieroModule } from './movimiento-financiero/movimiento-financiero.module';
import { DetalleArticulosEgresosModule } from './detalle-articulos-egresos/detalle-articulos-egresos.module';
import { CuentasFinancierasModule } from './cuentas-financieras/cuentas-financieras.module';
import { DetallepagoGastoModule } from './detallepago-gasto/detallepago-gasto.module';
import { ImpuestoModule } from './impuesto/impuesto.module';
import { ProductoModule } from './producto/producto.module';
import { DetalleimpuestoGastoModule } from './detalleimpuesto-gasto/detalleimpuesto-gasto.module';
import { TerminologiaGastoModule } from './terminologia-gasto/terminologia-gasto.module';
import { PersonaModule } from './persona/persona.module';
import { TerminologiaGrupoMovimientoModule } from './terminologia-grupo-movimiento/terminologia-grupo-movimiento.module';
import { CentroCostoModule } from './centro-costo/centro-costo.module';
import { UserAuditoriaModule } from './user-auditoria/user-auditoria.module';
import { PromocionModule } from './promocion/promocion.module';
import { PromocionBeneficioModule } from './promocion-beneficio/promocion-beneficio.module';
import { ProductoMovimientoModule } from './producto-movimiento/producto-movimiento.module';
import { EmpresaModule } from './empresa/empresa.module';
import { EmpresaAlmacenModule } from './empresa-almacen/empresa-almacen.module';
import { EmpresaSucursalModule } from './empresa-sucursal/empresa-sucursal.module';
import { ProgramaEntrenamientoModule } from './programa_entrenamiento/programa_entrenamiento.module';
import { EntrenamientoPlanModule } from './entrenamiento_plan/entrenamiento_plan.module';
import { EntrenamientoHorarioModule } from './entrenamiento_horario/entrenamiento_horario.module';
import { EntrenamientoBeneficiosModule } from './entrenamiento_beneficios/entrenamiento_beneficios.module';
import { EntrenamientoSucursalesModule } from './entrenamiento_sucursales/entrenamiento_sucursales.module';
import { PromocionCondicionModule } from './promocion-condicion/promocion-condicion.module';
import { BlobStorageModule } from './blob-storage/blob-storage.module';
import { VentaModule } from './venta/venta.module';
import { DetalleventaPagosModule } from './detalleventa_pagos/detalleventa_pagos.module';
import { DetalleventaProductosModule } from './detalleventa_productos/detalleventa_productos.module';
import { EntrenamientoCategoriaModule } from './entrenamiento_categoria/entrenamiento_categoria.module';
import { UbigeoModule } from './ubigeo/ubigeo.module';
import { DetalleventaMembresiasModule } from './detalleventa_membresias/detalleventa_membresias.module';
import { MembresiaExtensionModule } from './membresia_extension/membresia_extension.module';
import { MembresiaSeguimientoModule } from './membresia-seguimiento/membresia-seguimiento.module';
@Module({
  providers: [TasksService],
  imports: [
    ScheduleModule.forRoot(), // 👈 importante
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DB_HOST,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: 1433,
      synchronize: true,
      autoLoadEntities: true,
      options: {
        trustServerCertificate: true,
        // instanceName: process.env.DB_INSTANCE,
      },
      subscribers: [UserSubscriber],
    }),
    ContactoEmergenciaModule,
    DiasLaborablesModule,
    HorariosespecialesLaborablesModule,
    MarcacionModule,
    DetalleArticulosEgresosModule,
    DetallepagoGastoModule,
    DetalleimpuestoGastoModule,
    CentroCostoModule,
    ComentarioModule,
    // CRUDS CONFIGURACIONES
    ContratoEmpleadoModule,
    EntidadXUserModule,
    SeccionXModulouserModule,
    SeccionModule,
    UsuarioPermisosModule,
    SeccionXEntidadModule,
    ModuloXUserModule,
    ModuloModule,
    UserAuditoriaModule,
    // CRUDS PRINCIPALES


    ProductoModule,
    TerminologiaGrupoMovimientoModule,
    MovimientoFinancieroModule,
    PersonaModule,
    TerminologiaGastoModule,
    UserModule,
    TerminologiaModule,
    ImpuestoModule,
    CuentasFinancierasModule,
    TipoCambioModule,
    PromocionModule,
    PromocionCondicionModule,
    PromocionBeneficioModule,
    ProductoMovimientoModule,
    EmpresaModule,
    EmpresaAlmacenModule,
    EmpresaSucursalModule,
    ProgramaEntrenamientoModule,
    EntrenamientoPlanModule,
    EntrenamientoHorarioModule,
    EntrenamientoBeneficiosModule,
    EntrenamientoSucursalesModule,
    BlobStorageModule,
    VentaModule,
    DetalleventaPagosModule,
    DetalleventaProductosModule,
    EntrenamientoCategoriaModule,
    UbigeoModule,
    DetalleventaMembresiasModule,
    MembresiaExtensionModule,
    MembresiaSeguimientoModule,
  ],
})
export class AppModule {}
