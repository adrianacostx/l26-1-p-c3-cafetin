import Cl_sProductoApi from "./Cl_sProductoApi.js";
export default class Cl_sProducto {
    static TABLA = "producto";
    static async obtenerTodos() {
        const result = await Cl_sProductoApi.getTabla({ tabla: this.TABLA });
        return { ok: result.ok, data: result.tabla };
    }
    static async obtenerNombresUnicos() {
        const result = await this.obtenerTodos();
        if (!result.ok)
            return { ok: false, nombres: [] };
        const nombresUnicos = [...new Set(result.data.map((p) => p.nombre))].sort();
        return { ok: true, nombres: nombresUnicos };
    }
    static async agregar(producto) {
        const registro = { ...producto, tabla: this.TABLA };
        return await Cl_sProductoApi.agregar(registro);
    }
    static async actualizar(id, producto) {
        return await Cl_sProductoApi.actualizarPorId(id, { ...producto, tabla: this.TABLA });
    }
    static async eliminar(id) {
        const uri = `${Cl_sProductoApi['apiUrl']}/${id}`;
        const respuesta = await Cl_sProductoApi['fetchMockApi']({ method: "DELETE", uri });
        if (!respuesta.ok)
            return { ok: false, mensaje: "Error al eliminar producto" };
        return { ok: true, mensaje: "Producto eliminado" };
    }
}
//# sourceMappingURL=Cl_sProducto.js.map