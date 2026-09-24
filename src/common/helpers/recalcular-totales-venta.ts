import { EntityManager } from 'typeorm';
import { Venta } from 'src/venta/entities/venta.entity';
import { DetalleventaMembresia } from 'src/detalleventa_membresias/entities/detalleventa_membresia.entity';
import { DetalleventaProducto } from 'src/detalleventa_productos/entities/detalleventa_producto.entity';
import { DetalleventaPago } from 'src/detalleventa_pagos/entities/detalleventa_pago.entity';

// Recalcula los totales de una venta a partir de sus detalleventa_* activos (flag = 1):
// montoTotal_membresia, montoTotal_productos, montoPagos y montoDescuento (membresías + productos).
export async function recalcularTotalesVenta(manager: EntityManager, id_venta?: number | null) {
  if (id_venta === undefined || id_venta === null) return;

  const [membresias, productos, pagos] = await Promise.all([
    manager.getRepository(DetalleventaMembresia).find({ where: { id_venta, flag: true } }),
    manager.getRepository(DetalleventaProducto).find({ where: { id_venta, flag: true } }),
    manager.getRepository(DetalleventaPago).find({ where: { id_venta, flag: true } }),
  ]);

  const sumar = <T>(items: T[], valor: (item: T) => number | undefined) =>
    items.reduce((acc, item) => acc + Number(valor(item) ?? 0), 0);

  await manager.getRepository(Venta).update(id_venta, {
    montoTotal_membresia: sumar(membresias, m => m.montoTotal),
    montoTotal_productos: sumar(productos, p => p.montoTotal),
    montoPagos: sumar(pagos, p => p.monto),
    montoDescuento: sumar(membresias, m => m.montoDescuento) + sumar(productos, p => p.montoDescuento),
  });
}
