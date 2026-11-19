-- =====================================================================
-- SEED DE NUTRICIÓN (recetas e ingredientes) — proyecto-clinica (SQL Server)
-- Crea las terminologías que usan los ingredientes:
--      unidadIngrediente   -> ('nutricion', 'ingrediente', 'unidad')
--      alergenoIngrediente -> ('nutricion', 'ingrediente', 'alergeno')
--
-- PRE-REQUISITO: las tablas deben existir (synchronize: true las crea al
-- levantar la app una vez con npm run start:dev).
--
-- Es reejecutable: solo inserta los valores que todavía no existen.
-- =====================================================================

USE [NOMBRE_DE_TU_BASE_DE_DATOS]; -- reemplaza por el valor de DB_NAME en tu .env
GO

SET NOCOUNT ON;

;WITH nuevos (subgrupo, valor, orden) AS (
    SELECT * FROM (VALUES
        -- Unidades de medida. Los gramos de cada unidad se registran POR INGREDIENTE
        -- (1 taza de arroz no pesa lo mismo que 1 taza de harina)
        ('unidad', 'Gramo', 1),
        ('unidad', 'Kilogramo', 2),
        ('unidad', 'Mililitro', 3),
        ('unidad', 'Litro', 4),
        ('unidad', 'Taza', 5),
        ('unidad', 'Cucharada', 6),
        ('unidad', 'Cucharadita', 7),
        ('unidad', 'Unidad', 8),
        ('unidad', 'Rebanada', 9),
        ('unidad', 'Pizca', 10),

        -- Alérgenos (los 14 de declaración obligatoria en etiquetado)
        ('alergeno', 'Gluten', 1),
        ('alergeno', 'Crustáceos', 2),
        ('alergeno', 'Huevo', 3),
        ('alergeno', 'Pescado', 4),
        ('alergeno', 'Maní', 5),
        ('alergeno', 'Soya', 6),
        ('alergeno', 'Lácteos', 7),
        ('alergeno', 'Frutos de cáscara', 8),
        ('alergeno', 'Apio', 9),
        ('alergeno', 'Mostaza', 10),
        ('alergeno', 'Sésamo', 11),
        ('alergeno', 'Sulfitos', 12),
        ('alergeno', 'Altramuces', 13),
        ('alergeno', 'Moluscos', 14)
    ) AS v (subgrupo, valor, orden)
)
INSERT INTO Terminologia (uuid, entidad, grupo, subgrupo, valor, orden, flag)
SELECT NEWID(), 'nutricion', 'ingrediente', n.subgrupo, n.valor, n.orden, 1
FROM nuevos n
WHERE NOT EXISTS (
    SELECT 1 FROM Terminologia t
    WHERE t.entidad = 'nutricion' AND t.grupo = 'ingrediente'
      AND t.subgrupo = n.subgrupo AND t.valor = n.valor
);
GO
