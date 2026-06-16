export default interface I_vAdmin {

    mostrarPedidos(pedidos: any[]): void;
    mostrarProductos(productos: any[]): void;
    mostrarTotalEfectivoBS(total: number): void;
    mostrarTotalPagadoCliente(total: number): void;
    mostrarTotalRecaudadoHoy(total: number): void;
    mostrarProductoMasVendido(producto: any, unidades: number, ingreso: number): void;
    poblarFiltroProductos(nombres: string[]): void;
    mostrarModal(tipo: "success" | "danger" | "warning", mensaje: string): void;

    onProcesarPedido(callback: (id: string) => void): void;
    onCancelarPedido(callback: (id: string) => void): void;
    onFiltrarPedidos(callback: (filtros: { estado: string; metodoPago: string; fecha: string; producto: string }) => void): void;
    onBuscarProducto(callback: (texto: string) => void): void;
    onBuscarPorCodigo(callback: (codigo: string) => void): void;
    onBuscarCedula(callback: (cedula: string) => void): void;
    onGuardarProducto(callback: (producto: any) => void): void;
    onEliminarProducto(callback: (id: string, accion: "delete" | "disable" | "enable") => void): void;

    mostrar(): void;
    ocultar(): void;
}