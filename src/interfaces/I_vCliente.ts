export default interface I_vCliente {
    get nomCliente(): string;
    get metodoPago(): string;
    get referenciaPago(): string;
    get descripcionOtro(): string;
    onAgregarProducto(callback: (codigo: string, cantidad: number) => void): void;
    onEliminarProducto(callback: (codigo: string) => void): void;
    onEnviar(callback: () => void): void;
    mostrarProductos(productos: any[]): void;
    mostrarCarrito(items: any[]): void;
    mostrarTotal(total: number): void;
    limpiar(): void;
    mostrarAlerta(tipo: "success" | "danger" | "warning", mensaje: string): void;
}