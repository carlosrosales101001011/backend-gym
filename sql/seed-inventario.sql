-- =====================================================================
-- SEED DE INVENTARIO — proyecto-clinica (SQL Server)
-- Crea: terminologías, 3 sucursales, 20 almacenes (repartidos entre las
-- 3 sucursales), 30 productos y 50 movimientos de producto (entradas/salidas).
--
-- Ver SEED-INVENTARIO.md para la explicación paso a paso y el glosario,
-- incluyendo qué combinaciones (entidad, grupo, subgrupo) están
-- CONFIRMADAS por el equipo vs. cuáles son una extrapolación pendiente
-- de confirmar.
--
-- PRE-REQUISITO: las tablas deben existir. TypeORM las crea solo al
-- levantar la app una vez (synchronize: true en app.module.ts).
--      npm run start:dev   (déjalo iniciar y detenlo con Ctrl+C)
--
-- Este script asume que las tablas están vacías. Es reejecutable si
-- antes limpias los datos con la sección "LIMPIEZA" al final (comentada).
-- =====================================================================

USE [NOMBRE_DE_TU_BASE_DE_DATOS]; -- reemplaza por el valor de DB_NAME en tu .env
GO

SET NOCOUNT ON;

-- =====================================================================
-- 1. TERMINOLOGÍAS
--    Catálogo genérico: cada fila es un valor de una lista desplegable,
--    identificada por la terna (entidad, grupo, subgrupo).
--
--    CONFIRMADAS por el equipo:
--      categoriaProducto               -> ('producto', 'tipo', 'categoria')
--      marcaProducto                   -> ('producto', 'tipo', 'marca')
--      tipoMovimientoProducto          -> ('producto', 'tipo', 'movimiento')
--      motivoEntradaMovimientoProducto -> ('producto-movimiento', 'entrada', 'motivo')
--      motivoSalidaMovimientoProducto  -> ('producto-movimiento', 'salida', 'motivo')
--
--    EXTRAPOLADAS (siguiendo el mismo patrón, a confirmar):
--      estadoProducto        -> ('producto', 'tipo', 'estado')
--      unidadMedidaProducto  -> ('producto', 'tipo', 'unidadMedida')
--      tipoSucursal          -> ('empresa-sucursal', 'tipo', 'tipo')
--      estadoSucursal        -> ('empresa-sucursal', 'tipo', 'estado')
--      tipoAlmacen           -> ('empresa-almacen', 'tipo', 'tipo')
--      estadoAlmacen         -> ('empresa-almacen', 'tipo', 'estado')
-- =====================================================================

INSERT INTO Terminologia (uuid, entidad, grupo, subgrupo, valor, orden, flag) VALUES
-- Categorías de producto -> ('producto', 'tipo', 'categoria')
(NEWID(), 'producto', 'tipo', 'categoria', 'Medicamentos', 1, 1),
(NEWID(), 'producto', 'tipo', 'categoria', 'Insumos Médicos', 2, 1),
(NEWID(), 'producto', 'tipo', 'categoria', 'Equipos Médicos', 3, 1),
(NEWID(), 'producto', 'tipo', 'categoria', 'Material de Curación', 4, 1),
(NEWID(), 'producto', 'tipo', 'categoria', 'Higiene y Bioseguridad', 5, 1),
(NEWID(), 'producto', 'tipo', 'categoria', 'Laboratorio', 6, 1),
(NEWID(), 'producto', 'tipo', 'categoria', 'Odontología', 7, 1),
(NEWID(), 'producto', 'tipo', 'categoria', 'Oficina y Administración', 8, 1),

-- Marcas de producto -> ('producto', 'tipo', 'marca')
(NEWID(), 'producto', 'tipo', 'marca', 'Genérico', 1, 1),
(NEWID(), 'producto', 'tipo', 'marca', 'MedPlus', 2, 1),
(NEWID(), 'producto', 'tipo', 'marca', 'BioSalud', 3, 1),
(NEWID(), 'producto', 'tipo', 'marca', 'PharmaCorp', 4, 1),
(NEWID(), 'producto', 'tipo', 'marca', 'SaludTotal', 5, 1),
(NEWID(), 'producto', 'tipo', 'marca', 'NovaMed', 6, 1),
(NEWID(), 'producto', 'tipo', 'marca', 'ClinLab', 7, 1),
(NEWID(), 'producto', 'tipo', 'marca', 'VitaCare', 8, 1),
(NEWID(), 'producto', 'tipo', 'marca', 'MedTech', 9, 1),
(NEWID(), 'producto', 'tipo', 'marca', 'SanaVida', 10, 1),

-- Unidades de medida -> ('producto', 'tipo', 'unidadMedida') [extrapolado]
(NEWID(), 'producto', 'tipo', 'unidadMedida', 'Unidad', 1, 1),
(NEWID(), 'producto', 'tipo', 'unidadMedida', 'Caja', 2, 1),
(NEWID(), 'producto', 'tipo', 'unidadMedida', 'Frasco', 3, 1),
(NEWID(), 'producto', 'tipo', 'unidadMedida', 'Blister', 4, 1),
(NEWID(), 'producto', 'tipo', 'unidadMedida', 'Paquete', 5, 1),
(NEWID(), 'producto', 'tipo', 'unidadMedida', 'Rollo', 6, 1),

-- Estado del producto -> ('producto', 'tipo', 'estado') [extrapolado]
(NEWID(), 'producto', 'tipo', 'estado', 'Activo', 1, 1),
(NEWID(), 'producto', 'tipo', 'estado', 'Inactivo', 2, 1),
(NEWID(), 'producto', 'tipo', 'estado', 'Agotado', 3, 1),
(NEWID(), 'producto', 'tipo', 'estado', 'Por Vencer', 4, 1),

-- Tipo de movimiento de producto -> ('producto', 'tipo', 'movimiento')
(NEWID(), 'producto', 'tipo', 'movimiento', 'Entrada', 1, 1),
(NEWID(), 'producto', 'tipo', 'movimiento', 'Salida', 2, 1),
(NEWID(), 'producto', 'tipo', 'movimiento', 'Transferencia', 3, 1),

-- Tipo de sucursal -> ('empresa-sucursal', 'tipo', 'tipo') [extrapolado]
(NEWID(), 'empresa-sucursal', 'tipo', 'tipo', 'Principal', 1, 1),
(NEWID(), 'empresa-sucursal', 'tipo', 'tipo', 'Sucursal', 2, 1),
(NEWID(), 'empresa-sucursal', 'tipo', 'tipo', 'Almacén', 3, 1),
(NEWID(), 'empresa-sucursal', 'tipo', 'tipo', 'Otro', 4, 1),

-- Estado de sucursal -> ('empresa-sucursal', 'tipo', 'estado') [extrapolado]
(NEWID(), 'empresa-sucursal', 'tipo', 'estado', 'Activo', 1, 1),
(NEWID(), 'empresa-sucursal', 'tipo', 'estado', 'Inactivo', 2, 1),

-- Tipo de almacén -> ('empresa-almacen', 'tipo', 'tipo') [extrapolado]
(NEWID(), 'empresa-almacen', 'tipo', 'tipo', 'Principal', 1, 1),
(NEWID(), 'empresa-almacen', 'tipo', 'tipo', 'Secundario', 2, 1),
(NEWID(), 'empresa-almacen', 'tipo', 'tipo', 'Refrigerado', 3, 1),
(NEWID(), 'empresa-almacen', 'tipo', 'tipo', 'Otro', 4, 1),

-- Estado de almacén -> ('empresa-almacen', 'tipo', 'estado') [extrapolado]
(NEWID(), 'empresa-almacen', 'tipo', 'estado', 'Activo', 1, 1),
(NEWID(), 'empresa-almacen', 'tipo', 'estado', 'Inactivo', 2, 1),

-- Motivo de ENTRADA -> ('producto-movimiento', 'entrada', 'motivo')
(NEWID(), 'producto-movimiento', 'entrada', 'motivo', 'Compra a proveedor', 1, 1),
(NEWID(), 'producto-movimiento', 'entrada', 'motivo', 'Donación recibida', 2, 1),
(NEWID(), 'producto-movimiento', 'entrada', 'motivo', 'Devolución', 3, 1),

-- Motivo de SALIDA -> ('producto-movimiento', 'salida', 'motivo')
(NEWID(), 'producto-movimiento', 'salida', 'motivo', 'Venta / consumo interno', 1, 1),
(NEWID(), 'producto-movimiento', 'salida', 'motivo', 'Merma / Vencimiento', 2, 1),
(NEWID(), 'producto-movimiento', 'salida', 'motivo', 'Ajuste de inventario', 3, 1);
GO

-- =====================================================================
-- 2. SUCURSALES (3)
-- =====================================================================

INSERT INTO empresa_sucursal (codigo, nombre, id_tipo, label_tipo, direccion, ubigeo, telefono, email, id_estado, label_estado, flag)
SELECT 'SUC-01', 'Sede Principal - Lima Centro', t.id, t.valor, 'Av. Principal 123, Lima', '150101', '01-4567890', 'lima.centro@clinica.com', e.id, e.valor, 1
FROM Terminologia t
CROSS JOIN Terminologia e
WHERE t.entidad = 'empresa-sucursal' AND t.grupo = 'tipo' AND t.subgrupo = 'tipo' AND t.valor = 'Principal'
  AND e.entidad = 'empresa-sucursal' AND e.grupo = 'tipo' AND e.subgrupo = 'estado' AND e.valor = 'Activo';

INSERT INTO empresa_sucursal (codigo, nombre, id_tipo, label_tipo, direccion, ubigeo, telefono, email, id_estado, label_estado, flag)
SELECT 'SUC-02', 'Sucursal Norte - Trujillo', t.id, t.valor, 'Jr. Los Robles 456, Trujillo', '130101', '044-556677', 'trujillo@clinica.com', e.id, e.valor, 1
FROM Terminologia t
CROSS JOIN Terminologia e
WHERE t.entidad = 'empresa-sucursal' AND t.grupo = 'tipo' AND t.subgrupo = 'tipo' AND t.valor = 'Sucursal'
  AND e.entidad = 'empresa-sucursal' AND e.grupo = 'tipo' AND e.subgrupo = 'estado' AND e.valor = 'Activo';

INSERT INTO empresa_sucursal (codigo, nombre, id_tipo, label_tipo, direccion, ubigeo, telefono, email, id_estado, label_estado, flag)
SELECT 'SUC-03', 'Sucursal Sur - Arequipa', t.id, t.valor, 'Calle Mercaderes 789, Arequipa', '040101', '054-778899', 'arequipa@clinica.com', e.id, e.valor, 1
FROM Terminologia t
CROSS JOIN Terminologia e
WHERE t.entidad = 'empresa-sucursal' AND t.grupo = 'tipo' AND t.subgrupo = 'tipo' AND t.valor = 'Sucursal'
  AND e.entidad = 'empresa-sucursal' AND e.grupo = 'tipo' AND e.subgrupo = 'estado' AND e.valor = 'Activo';
GO

-- =====================================================================
-- 3. ALMACENES (20) — repartidos entre las 3 sucursales (round-robin)
-- =====================================================================

;WITH Numeros AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM Numeros WHERE n < 20
),
Sucursales AS (
    SELECT id, nombre, ROW_NUMBER() OVER (ORDER BY id) AS rn
    FROM empresa_sucursal
    WHERE flag = 1
),
TipoAlmacen AS (
    SELECT id, valor, ROW_NUMBER() OVER (ORDER BY orden) AS rn
    FROM Terminologia
    WHERE entidad = 'empresa-almacen' AND grupo = 'tipo' AND subgrupo = 'tipo'
),
EstadoAlmacen AS (
    SELECT TOP 1 id, valor
    FROM Terminologia
    WHERE entidad = 'empresa-almacen' AND grupo = 'tipo' AND subgrupo = 'estado' AND valor = 'Activo'
)
INSERT INTO empresa_almacen (id_sucursal, label_sucursal, codigo, nombre, id_tipo, label_tipo, direccion, capacidad, id_estado, label_estado, flag)
SELECT
    s.id,
    s.nombre,
    'ALM-' + RIGHT('00' + CAST(num.n AS varchar(2)), 2),
    'Almacén ' + RIGHT('00' + CAST(num.n AS varchar(2)), 2) + ' - ' + s.nombre,
    ta.id,
    ta.valor,
    'Zona de almacenamiento ' + CAST(num.n AS varchar(2)),
    500 + (num.n * 25),
    ea.id,
    ea.valor,
    1
FROM Numeros num
JOIN Sucursales s   ON s.rn  = ((num.n - 1) % 3) + 1
JOIN TipoAlmacen ta ON ta.rn = ((num.n - 1) % 4) + 1
CROSS JOIN EstadoAlmacen ea
OPTION (MAXRECURSION 100);
GO

-- =====================================================================
-- 4. PRODUCTOS (30)
-- =====================================================================

IF OBJECT_ID('tempdb..#ProductosSeed') IS NOT NULL DROP TABLE #ProductosSeed;
CREATE TABLE #ProductosSeed (
    n INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100),
    codigo_barra VARCHAR(120),
    codigo_sku VARCHAR(120),
    descripcion VARCHAR(255),
    stock_actual INT,
    stock_max INT,
    stock_min INT,
    categoria VARCHAR(150),
    marca VARCHAR(150),
    unidad VARCHAR(150)
);

INSERT INTO #ProductosSeed (nombre, codigo_barra, codigo_sku, descripcion, stock_actual, stock_max, stock_min, categoria, marca, unidad) VALUES
('Paracetamol 500mg', '7501234500001', 'SKU-0001', 'Analgésico y antipirético, caja x100 tabletas', 120, 300, 30, 'Medicamentos', 'Genérico', 'Caja'),
('Ibuprofeno 400mg', '7501234500002', 'SKU-0002', 'Antiinflamatorio, caja x100 tabletas', 100, 300, 30, 'Medicamentos', 'PharmaCorp', 'Caja'),
('Amoxicilina 500mg', '7501234500003', 'SKU-0003', 'Antibiótico, caja x100 cápsulas', 80, 250, 25, 'Medicamentos', 'MedPlus', 'Caja'),
('Omeprazol 20mg', '7501234500004', 'SKU-0004', 'Protector gástrico, caja x30 cápsulas', 90, 250, 25, 'Medicamentos', 'SaludTotal', 'Caja'),
('Loratadina 10mg', '7501234500005', 'SKU-0005', 'Antihistamínico, caja x100 tabletas', 70, 200, 20, 'Medicamentos', 'NovaMed', 'Caja'),
('Diclofenaco gel 60g', '7501234500006', 'SKU-0006', 'Antiinflamatorio tópico', 60, 180, 15, 'Medicamentos', 'BioSalud', 'Unidad'),
('Suero fisiológico 500ml', '7501234500007', 'SKU-0007', 'Solución salina 0.9%', 150, 400, 40, 'Medicamentos', 'ClinLab', 'Frasco'),
('Alcohol en gel 500ml', '7501234500008', 'SKU-0008', 'Antiséptico para manos', 200, 500, 50, 'Higiene y Bioseguridad', 'VitaCare', 'Frasco'),
('Jabón antibacterial 250ml', '7501234500009', 'SKU-0009', 'Higiene de manos', 130, 300, 30, 'Higiene y Bioseguridad', 'SanaVida', 'Frasco'),
('Desinfectante de superficies 1L', '7501234500010', 'SKU-0010', 'Limpieza y desinfección de áreas', 110, 300, 30, 'Higiene y Bioseguridad', 'MedTech', 'Frasco'),
('Guantes de látex talla M', '7501234500011', 'SKU-0011', 'Caja x100 unidades', 90, 250, 25, 'Higiene y Bioseguridad', 'Genérico', 'Caja'),
('Mascarilla quirúrgica', '7501234500012', 'SKU-0012', 'Caja x50 unidades', 200, 500, 50, 'Higiene y Bioseguridad', 'MedPlus', 'Caja'),
('Tapabocas N95', '7501234500013', 'SKU-0013', 'Caja x20 unidades', 80, 200, 20, 'Higiene y Bioseguridad', 'BioSalud', 'Caja'),
('Cofia descartable', '7501234500014', 'SKU-0014', 'Paquete x100 unidades', 70, 200, 20, 'Higiene y Bioseguridad', 'PharmaCorp', 'Paquete'),
('Bata descartable', '7501234500015', 'SKU-0015', 'Bata quirúrgica desechable', 60, 180, 15, 'Higiene y Bioseguridad', 'SaludTotal', 'Unidad'),
('Lentes de protección', '7501234500016', 'SKU-0016', 'Protección ocular reutilizable', 50, 150, 15, 'Equipos Médicos', 'NovaMed', 'Unidad'),
('Jeringa descartable 5ml', '7501234500017', 'SKU-0017', 'Caja x100 unidades', 150, 400, 40, 'Insumos Médicos', 'ClinLab', 'Caja'),
('Gasa estéril 10x10cm', '7501234500018', 'SKU-0018', 'Paquete x50 unidades', 130, 350, 35, 'Material de Curación', 'VitaCare', 'Paquete'),
('Vendas elásticas 10cm', '7501234500019', 'SKU-0019', 'Rollo de venda elástica', 100, 300, 30, 'Material de Curación', 'SanaVida', 'Rollo'),
('Esparadrapo hipoalergénico', '7501234500020', 'SKU-0020', 'Rollo 5cm x 5m', 90, 250, 25, 'Material de Curación', 'MedTech', 'Rollo'),
('Algodón hidrófilo 500g', '7501234500021', 'SKU-0021', 'Bolsa de algodón médico', 80, 220, 20, 'Material de Curación', 'Genérico', 'Unidad'),
('Suturas quirúrgicas', '7501234500022', 'SKU-0022', 'Caja x12 unidades', 40, 120, 10, 'Insumos Médicos', 'MedPlus', 'Caja'),
('Kit de sutura básico', '7501234500023', 'SKU-0023', 'Set de instrumental básico de sutura', 25, 80, 8, 'Equipos Médicos', 'BioSalud', 'Unidad'),
('Termómetro digital', '7501234500024', 'SKU-0024', 'Termómetro clínico digital', 45, 120, 12, 'Equipos Médicos', 'PharmaCorp', 'Unidad'),
('Tensiómetro digital', '7501234500025', 'SKU-0025', 'Equipo de presión arterial digital', 30, 90, 10, 'Equipos Médicos', 'SaludTotal', 'Unidad'),
('Oxímetro de pulso', '7501234500026', 'SKU-0026', 'Medidor de saturación de oxígeno', 35, 100, 10, 'Equipos Médicos', 'NovaMed', 'Unidad'),
('Camilla desechable (rollo de papel)', '7501234500027', 'SKU-0027', 'Rollo de papel camilla', 60, 180, 15, 'Insumos Médicos', 'ClinLab', 'Rollo'),
('Baja lenguas', '7501234500028', 'SKU-0028', 'Paquete x100 unidades de madera', 100, 300, 30, 'Insumos Médicos', 'VitaCare', 'Paquete'),
('Cinta métrica médica', '7501234500029', 'SKU-0029', 'Cinta métrica flexible', 40, 100, 10, 'Equipos Médicos', 'SanaVida', 'Unidad'),
('Kit de bioseguridad básico', '7501234500030', 'SKU-0030', 'Set: guantes + mascarilla + protector ocular', 50, 150, 15, 'Higiene y Bioseguridad', 'MedTech', 'Unidad');

INSERT INTO Producto (
    nombre, codigo_barra, codigo_sku, descripcion, stock_actual, stock_max, stock_min,
    id_categoria, label_categoria, id_marca, label_marca, id_unidadMedida, label_unidadMedida,
    id_estado, label_estado, id_sucursal, label_sucursal, id_almacen, label_almacen, flag
)
SELECT
    p.nombre, p.codigo_barra, p.codigo_sku, p.descripcion, p.stock_actual, p.stock_max, p.stock_min,
    tc.id, tc.valor,
    tm.id, tm.valor,
    tu.id, tu.valor,
    te.id, te.valor,
    a.id_sucursal, a.label_sucursal,
    a.id, a.nombre,
    1
FROM #ProductosSeed p
JOIN Terminologia tc ON tc.entidad = 'producto' AND tc.grupo = 'tipo' AND tc.subgrupo = 'categoria' AND tc.valor = p.categoria
JOIN Terminologia tm ON tm.entidad = 'producto' AND tm.grupo = 'tipo' AND tm.subgrupo = 'marca' AND tm.valor = p.marca
JOIN Terminologia tu ON tu.entidad = 'producto' AND tu.grupo = 'tipo' AND tu.subgrupo = 'unidadMedida' AND tu.valor = p.unidad
JOIN Terminologia te ON te.entidad = 'producto' AND te.grupo = 'tipo' AND te.subgrupo = 'estado' AND te.valor = 'Activo'
JOIN (
    SELECT id, id_sucursal, label_sucursal, nombre, ROW_NUMBER() OVER (ORDER BY id) AS rn
    FROM empresa_almacen
) a ON a.rn = ((p.n - 1) % 20) + 1;

DROP TABLE #ProductosSeed;
GO

-- =====================================================================
-- 5. MOVIMIENTOS DE PRODUCTO (50) — 25 entradas + 25 salidas
--    Simplificación deliberada: como solo se piden entradas y salidas
--    (no transferencias), sucursal/almacén origen = sucursal/almacén
--    destino = el almacén "hogar" del producto. Una entrada representa
--    mercadería que ingresa a ese almacén (compra/donación); una salida
--    representa mercadería que sale de ese almacén (venta/consumo/merma).
-- =====================================================================

;WITH Numeros AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM Numeros WHERE n < 50
),
Productos AS (
    SELECT id, nombre, label_marca, id_sucursal, label_sucursal, id_almacen, label_almacen,
           ROW_NUMBER() OVER (ORDER BY id) AS rn
    FROM Producto
    WHERE flag = 1
),
TipoEntrada AS (
    SELECT id, valor FROM Terminologia
    WHERE entidad = 'producto' AND grupo = 'tipo' AND subgrupo = 'movimiento' AND valor = 'Entrada'
),
TipoSalida AS (
    SELECT id, valor FROM Terminologia
    WHERE entidad = 'producto' AND grupo = 'tipo' AND subgrupo = 'movimiento' AND valor = 'Salida'
),
MotivosEntrada AS (
    SELECT id, valor, ROW_NUMBER() OVER (ORDER BY orden) AS rn FROM Terminologia
    WHERE entidad = 'producto-movimiento' AND grupo = 'entrada' AND subgrupo = 'motivo'
),
MotivosSalida AS (
    SELECT id, valor, ROW_NUMBER() OVER (ORDER BY orden) AS rn FROM Terminologia
    WHERE entidad = 'producto-movimiento' AND grupo = 'salida' AND subgrupo = 'motivo'
)
INSERT INTO producto_movimiento (
    id_producto, id_tipo_movimiento, label_tipo_movimiento, label_producto, label_marca_producto,
    id_sucursal_origen, label_sucursal_origen, id_almacen_origen, label_almacen_origen,
    id_sucursal_destino, label_sucursal_destino, id_almacen_destino, label_almacen_destino,
    id_motivo, label_motivo, cantidad_movimiento, flag
)
SELECT
    pr.id,
    CASE WHEN num.n % 2 = 1 THEN te.id ELSE ts.id END,
    CASE WHEN num.n % 2 = 1 THEN te.valor ELSE ts.valor END,
    pr.nombre, pr.label_marca,
    pr.id_sucursal, pr.label_sucursal, pr.id_almacen, pr.label_almacen,
    pr.id_sucursal, pr.label_sucursal, pr.id_almacen, pr.label_almacen,
    CASE WHEN num.n % 2 = 1 THEN me.id ELSE ms.id END,
    CASE WHEN num.n % 2 = 1 THEN me.valor ELSE ms.valor END,
    5 + ((num.n * 7) % 95),
    1
FROM Numeros num
JOIN Productos pr ON pr.rn = ((num.n - 1) % 30) + 1
CROSS JOIN TipoEntrada te
CROSS JOIN TipoSalida ts
JOIN MotivosEntrada me ON me.rn = ((num.n - 1) % 3) + 1
JOIN MotivosSalida ms ON ms.rn = ((num.n - 1) % 3) + 1
OPTION (MAXRECURSION 100);
GO

-- =====================================================================
-- 6. VERIFICACIÓN
-- =====================================================================

SELECT 'Terminologia' AS tabla, COUNT(*) AS total FROM Terminologia
UNION ALL SELECT 'empresa_sucursal', COUNT(*) FROM empresa_sucursal
UNION ALL SELECT 'empresa_almacen', COUNT(*) FROM empresa_almacen
UNION ALL SELECT 'Producto', COUNT(*) FROM Producto
UNION ALL SELECT 'producto_movimiento', COUNT(*) FROM producto_movimiento;

SELECT label_sucursal, COUNT(*) AS almacenes_por_sucursal
FROM empresa_almacen
GROUP BY label_sucursal;

SELECT label_tipo_movimiento, COUNT(*) AS total
FROM producto_movimiento
GROUP BY label_tipo_movimiento;
GO

-- =====================================================================
-- LIMPIEZA (opcional) — descomenta para poder reejecutar el script.
-- Respeta el orden inverso de dependencias.
-- =====================================================================
-- DELETE FROM producto_movimiento;
-- DELETE FROM Producto;
-- DELETE FROM empresa_almacen;
-- DELETE FROM empresa_sucursal;
-- DELETE FROM Terminologia WHERE entidad IN ('producto','empresa-sucursal','empresa-almacen','producto-movimiento');
-- GO
