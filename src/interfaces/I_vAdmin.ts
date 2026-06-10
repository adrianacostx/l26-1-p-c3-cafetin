export default interface I_vAdmin {
    mostrarPedidos(pedidos: any[]): void;
    mostrarProductos(productos: any[]): void;
    poblarFiltroProductos(nombres: string[]): void;
    onProcesarPedido(callback: (id: string) => void): void;
    onCancelarPedido(callback: (id: string) => void): void;
    onFiltrarPedidos(callback: (filtros: { estado: string; metodoPago: string; fecha: string; producto: string }) => void): void;
    onBuscarProducto(callback: (texto: string) => void): void;
    onGuardarProducto(callback: (producto: any) => void): void;
    onEliminarProducto(callback: (id: string) => void): void;
    mostrarModal(tipo: "success" | "danger" | "warning", mensaje: string): void;
}