# Seed de Inventario (SQL Server)

Script para poblar el módulo de inventario de `proyecto-clinica` con datos de prueba:

- **30 productos** (`Producto`), cada uno con categoría, marca, unidad de medida y ubicados en un almacén/sucursal.
- **50 movimientos de producto** (`producto_movimiento`): 25 entradas + 25 salidas.
- **3 sucursales** (`empresa_sucursal`).
- **20 almacenes** (`empresa_almacen`), repartidos entre las 3 sucursales.
- Todas las **terminologías** (catálogos/listas desplegables) que estos datos necesitan.

El script SQL está en [`sql/seed-inventario.sql`](sql/seed-inventario.sql).

## 1. Glosario / terminología del proyecto

Antes de tocar la base de datos conviene entender el patrón que usa este backend (NestJS + TypeORM + SQL Server, `synchronize: true`):

| Término | Qué es |
|---|---|
| **Terminología** (`Terminologia`) | Tabla catálogo **genérica** que reemplaza a tener una tabla `categoria`, otra `marca`, otra `estado`, etc. Cada fila es un valor de una lista desplegable. |
| `entidad` | A qué entidad de negocio pertenece el valor (ej. `PRODUCTO`, `EMPRESA_SUCURSAL`, `EMPRESA_ALMACEN`, `PRODUCTO_MOVIMIENTO`). |
| `grupo` | Qué lista es, dentro de esa entidad (ej. `CATEGORIA`, `MARCA`, `TIPO`, `ESTADO`, `TIPO_MOVIMIENTO`, `MOTIVO`). |
| `subgrupo` | Subdivisión opcional dentro del grupo (no se usa en este seed, queda `''`). |
| `valor` | El texto visible para el usuario (ej. `"Medicamentos"`, `"Activo"`, `"Entrada"`). |
| `orden` | Orden de aparición en combos/selects. |
| Patrón `id_*` / `label_*` | Cada entidad que referencia una terminología (u otra tabla) guarda **dos columnas**: el `id` (FK real) y el `label` (copia desnormalizada del texto, ej. `id_categoria` + `label_categoria`). Esto evita hacer `JOIN` en cada lectura del listado — el `label` se recalcula solo cuando se crea/actualiza el registro (ver `producto.service.ts` / `producto-movimiento.service.ts`). |
| `flag` (bit) | Borrado lógico (*soft delete*). `1` = activo/visible, `0` = eliminado. Nunca se hace `DELETE` desde la app, se hace `UPDATE flag = 0`. |
| **Sucursal** (`empresa_sucursal`) | Sede física de la empresa (local, clínica, oficina). Tiene su propio `id_tipo` (Principal, Sucursal, Almacén, Otro) y `id_estado`. |
| **Almacén** (`empresa_almacen`) | Depósito físico de mercadería. **Siempre pertenece a una sucursal** (`id_sucursal` es obligatorio) — no existe almacén "suelto". Un almacén tiene su propio `id_tipo` (Principal, Secundario, Refrigerado, Otro). |
| **Producto** (`Producto`) | Ítem de inventario. Guarda su categoría, marca, unidad de medida, estado, y la sucursal/almacén donde reside actualmente (`id_sucursal`, `id_almacen`), además de `stock_actual`, `stock_min`, `stock_max`. |
| **Movimiento de producto** (`producto_movimiento`) | Registro de kardex: entrada, salida o transferencia de un producto. Guarda sucursal/almacén **origen** y **destino** (ambos obligatorios en la tabla), el `motivo` y la `cantidad_movimiento`. |
| **Entrada** | Tipo de movimiento que **incrementa** el stock (compra, donación, devolución de cliente). |
| **Salida** | Tipo de movimiento que **reduce** el stock (venta, consumo interno, merma/vencimiento). |
| **Transferencia** | Tipo de movimiento que mueve stock entre almacenes/sucursales distintos (origen ≠ destino). *No se usa en este seed* porque solo se pidieron entradas y salidas. |

### Mapeo exacto de `(entidad, grupo, subgrupo)`

`Terminologia` se consulta con `findAllbyEntidadGrupoAndSubGrupo(entidad, grupo, subgrupo)`, así que la terna exacta importa (es texto, sensible a como se escriba). Estas son las combinaciones:

**Confirmadas por el equipo:**

| Catálogo | entidad | grupo | subgrupo |
|---|---|---|---|
| Categoría de producto | `producto` | `tipo` | `categoria` |
| Marca de producto | `producto` | `tipo` | `marca` |
| Tipo de movimiento (Entrada/Salida/Transferencia) | `producto` | `tipo` | `movimiento` |
| Motivo de **entrada** | `producto-movimiento` | `entrada` | `motivo` |
| Motivo de **salida** | `producto-movimiento` | `salida` | `motivo` |

Nota: el catálogo de motivos **no es una sola lista filtrada por tipo** — son dos listas independientes (`grupo='entrada'` y `grupo='salida'`), cada una con su propio conjunto de valores y `orden`.

**Extrapoladas siguiendo el mismo patrón** (no confirmadas explícitamente — revísalas antes de usarlas en producción):

| Catálogo | entidad | grupo | subgrupo |
|---|---|---|---|
| Estado de producto | `producto` | `tipo` | `estado` |
| Unidad de medida | `producto` | `tipo` | `unidadMedida` |
| Tipo de sucursal | `empresa-sucursal` | `tipo` | `tipo` |
| Estado de sucursal | `empresa-sucursal` | `tipo` | `estado` |
| Tipo de almacén | `empresa-almacen` | `tipo` | `tipo` |
| Estado de almacén | `empresa-almacen` | `tipo` | `estado` |

Si tu equipo ya tiene definidas las ternas para estos últimos 6 catálogos, avísame y actualizo el script — son un simple `find & replace` en `sql/seed-inventario.sql`.

### Decisión de modelado en este seed

Como la tabla `producto_movimiento` exige `id_sucursal_origen`, `id_almacen_origen`, `id_sucursal_destino` e `id_almacen_destino` como **no nulos**, y aquí solo generamos entradas/salidas (no transferencias), el script usa el mismo almacén como origen y destino:

- **Entrada**: mercadería que ingresa a ese almacén (compra a proveedor, donación, devolución).
- **Salida**: mercadería que sale de ese almacén (venta/consumo interno, merma, ajuste).

Si más adelante se seedean **transferencias**, ahí sí origen y destino deben ser sucursales/almacenes distintos.

## 2. Orden de dependencias

El script respeta este orden porque cada tabla depende de la anterior:

```
1. Terminologia            (sin dependencias)
2. empresa_sucursal         (usa Terminologia para id_tipo / id_estado)
3. empresa_almacen          (usa empresa_sucursal + Terminologia)
4. Producto                 (usa Terminologia + empresa_almacen)
5. producto_movimiento      (usa Producto + Terminologia)
```

## 3. Cómo ejecutarlo

1. **Crea las tablas primero.** Este proyecto usa `synchronize: true` en `TypeOrmModule.forRoot` (`src/app.module.ts`), así que TypeORM genera el esquema solo con levantar la app una vez:
   ```bash
   npm install
   npm run start:dev
   ```
   Espera a que conecte a SQL Server y detén el proceso (Ctrl+C). Las tablas `Terminologia`, `empresa_sucursal`, `empresa_almacen`, `Producto` y `producto_movimiento` ya existirán.

2. **Edita el nombre de la base de datos** en la primera línea de [`sql/seed-inventario.sql`](sql/seed-inventario.sql):
   ```sql
   USE [NOMBRE_DE_TU_BASE_DE_DATOS]; -- el mismo valor que DB_NAME en tu .env
   ```

3. **Ejecuta el script** con SSMS, Azure Data Studio, o `sqlcmd`:
   ```bash
   sqlcmd -S <host>,1433 -U <usuario> -P <password> -i sql/seed-inventario.sql
   ```

4. El script termina con `SELECT` de verificación que muestran totales por tabla, almacenes por sucursal y movimientos por tipo.

## 4. Reejecutar el script

El script **no es idempotente** (no valida si ya existen los datos): correrlo dos veces duplica todo. Al final del archivo hay una sección **LIMPIEZA** comentada que borra los datos en orden inverso de dependencias — descoméntala y ejecútala antes de volver a correr el seed si necesitas reiniciar.

## 5. Qué genera exactamente

- **49 terminologías**: 8 categorías, 10 marcas, 6 unidades de medida, 4 estados de producto, 3 tipos de movimiento, 4 tipos + 2 estados de sucursal, 4 tipos + 2 estados de almacén, 3 motivos de entrada, 3 motivos de salida.
- **3 sucursales**: Lima Centro (Principal), Trujillo y Arequipa (Sucursal).
- **20 almacenes**: repartidos en round-robin entre las 3 sucursales (≈6-7 por sucursal), alternando tipo Principal/Secundario/Refrigerado/Otro.
- **30 productos**: insumos y equipos típicos de una clínica (medicamentos, material de curación, bioseguridad, equipos médicos), repartidos en round-robin entre los 20 almacenes.
- **50 movimientos**: alternando Entrada/Salida, con motivo y cantidad variable, uno por cada producto en ciclo (30 productos → 50 movimientos, algunos productos tienen más de un movimiento).
