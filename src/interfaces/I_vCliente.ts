export default interface I_vCliente {
    get nomCliente(): string;
    get cedulaCliente(): string;
    get metodoPago(): string;
    get referenciaPago(): string;
    get descripcionOtro(): string;
    get montoEfectivo(): string;
    get montoEfectivoUSD(): string;

    setNombreCliente(nombre: string): void;

    mostrarProductos(productos: any[]): void;
    mostrarCarrito(items: any[]): void;
    mostrarTotal(totalUSD: number, totalBs: number): void;
    mostrarAlerta(tipo: "success" | "danger" | "warning", mensaje: string): void;

    onAgregarProducto(callback: (codigo: string, cantidad: number) => void): void;
    onEliminarProducto(callback: (codigo: string) => void): void;
    onBuscarProducto(callback: (texto: string) => void): void;
    onBuscarPorCategoria(callback: (categoria: string) => void): void;
    onCedulaChange(callback: (cedula: string) => void): void;
    onEnviar(callback: () => void): void;

    limpiar(): void;

    mostrar(): void;
    ocultar(): void;
}