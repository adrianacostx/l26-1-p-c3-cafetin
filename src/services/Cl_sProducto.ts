import Cl_sProductoApi from "./Cl_sProductoApi.js";

export default class Cl_sProducto {
    private static TABLA = "producto";

    static async obtenerTodos(): Promise<{ ok: boolean; data: any[] }> {
        const result = await Cl_sProductoApi.getTabla({ tabla: this.TABLA });
        return { ok: result.ok, data: result.tabla };
    }

    static async obtenerNombresUnicos(): Promise<{ ok: boolean; nombres: string[] }> {
        const result = await this.obtenerTodos();
        if (!result.ok) return { ok: false, nombres: [] };
        const nombresUnicos = [...new Set(result.data.map((p: any) => p.nombre))].sort();
        return { ok: true, nombres: nombresUnicos };
    }

    static async agregar(producto: any): Promise<{ ok: boolean; mensaje: string }> {
        const registro = { ...producto, tabla: this.TABLA };
        return await Cl_sProductoApi.agregar(registro);
    }

    static async actualizar(id: string, producto: any): Promise<{ ok: boolean; mensaje: string }> {
        return await Cl_sProductoApi.actualizarPorId(id, { ...producto, tabla: this.TABLA });
    }

    static async eliminar(id: string): Promise<{ ok: boolean; mensaje: string }> {
        const uri = `${Cl_sProductoApi['apiUrl']}/${id}`;
        const respuesta = await Cl_sProductoApi['fetchMockApi']({ method: "DELETE", uri });
        if (!respuesta.ok) return { ok: false, mensaje: "Error al eliminar producto" };
        return { ok: true, mensaje: "Producto eliminado" };
    }
}