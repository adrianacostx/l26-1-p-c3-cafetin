export default interface I_vAdmin {
    mostrarPedidos(pedidos: any[]): void;
    mostrarProductos(productos: any[]): void;
    mostrarTotalEfectivoBS(total: number): void;
    mostrarTotalPagadoCliente(totalUSD: number, totalBs: number): void;
    mostrarTotalRecaudadoHoy(totalUSD: number, totalBs: number): void;

    // Solo producto y unidades (sin ingreso)
    mostrarProductoMasVendido(producto: any, unidades: number): void;

    // Ingreso en USD y Bs.
    mostrarProductoMayorIngreso(producto: any, ingresoUSD: number, ingresoBs: number): void;

    poblarFiltroProductos(nombres: string[]): void;
    poblarSelectAnalisisProducto(productos: any[]): void;

    mostrarEstadisticasProducto(unidades: number, ingresoUSD: number, ingresoBs: number): void;

    mostrarModal(tipo: "success" | "danger" | "warning", mensaje: string): void;

    onProcesarPedido(callback: (id: string) => void): void;
    onCancelarPedido(callback: (id: string) => void): void;
    onFiltrarPedidos(callback: (filtros: { estado: string; metodoPago: string; fecha: string; producto: string }) => void): void;
    onBuscarProducto(callback: (texto: string) => void): void;
    onBuscarPorCodigo(callback: (codigo: string) => void): void;
    onBuscarCedula(callback: (cedula: string) => void): void;
    onGuardarProducto(callback: (producto: any) => void): void;
    onEliminarProducto(callback: (id: string, accion: "delete" | "disable" | "enable") => void): void;
    onAnalisisProducto(callback: (codigo: string) => void): void;

    mostrar(): void;
    ocultar(): void;
}