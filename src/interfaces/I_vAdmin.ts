export default interface I_vAdmin {
    mostrarPedidos(pedidos: any[]): void;
    mostrarProductos(productos: any[]): void;
    onProcesarPedido(callback: (id: string) => void): void;
    onCancelarPedido(callback: (id: string) => void): void;
    onFiltrarPedidos(callback: (filtros: { estado: string; metodoPago: string }) => void): void;
    onGuardarProducto(callback: (producto: any) => void): void;
    onEliminarProducto(callback: (id: string) => void): void;
    mostrarModal(tipo: "success" | "danger" | "warning", mensaje: string): void;
}