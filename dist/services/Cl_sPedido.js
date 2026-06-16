import Cl_sPedidoApi from "./Cl_sPedidoApi.js";
export default class Cl_sPedido {
    static TABLA = "Pedido";
    static async agregar(pedido) {
        // validaciones
        if (!pedido.NomCliente || pedido.NomCliente.trim() === "") {
            return { ok: false, mensaje: "El nombre del cliente es obligatorio" };
        }
        if (!pedido.Cedula || pedido.Cedula.trim() === "") {
            return { ok: false, mensaje: "La cédula es obligatoria" };
        }
        if (!pedido.Items || pedido.Items.length === 0) {
            return { ok: false, mensaje: "El pedido debe tener al menos un producto" };
        }
        if (!pedido.MetodoPago) {
            return { ok: false, mensaje: "Debe seleccionar un método de pago" };
        }
        const registro = { ...pedido, tabla: this.TABLA };
        return await Cl_sPedidoApi.agregar(registro);
    }
    static async obtenerTodos() {
        const result = await Cl_sPedidoApi.getTabla({ tabla: this.TABLA });
        return { ok: result.ok, data: result.tabla };
    }
    static async actualizarEstado(id, nuevoEstado) {
        if (!id)
            return { ok: false, mensaje: "ID de pedido inválido" };
        const estadosPermitidos = ["Pendiente", "Procesado", "Cancelado"];
        if (!estadosPermitidos.includes(nuevoEstado)) {
            return { ok: false, mensaje: "Estado no permitido" };
        }
        const data = { estado: nuevoEstado };
        return await Cl_sPedidoApi.actualizarPorId(id, data);
    }
}
//# sourceMappingURL=Cl_sPedido.js.map