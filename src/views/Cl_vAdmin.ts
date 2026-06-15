import I_vAdmin from "../interfaces/I_vAdmin.js";

export default class Cl_vAdmin implements I_vAdmin {
    private tablaPedidos: HTMLTableSectionElement;
    private filtroEstado: HTMLSelectElement;
    private filtroMetodoPago: HTMLSelectElement;
    private filtroFecha: HTMLInputElement;
    private filtroProducto: HTMLSelectElement;
    private tablaProductos: HTMLTableSectionElement;
    private formProducto: HTMLFormElement;
    private btnGuardarProducto: HTMLButtonElement;
    private inputBuscarProducto: HTMLInputElement;
    private inputBuscarCedula: HTMLInputElement;
    private btnBuscarCedula: HTMLButtonElement;
    private spanTotalEfectivoBs: HTMLElement;
    private spanTotalPagadoCliente: HTMLElement;
    private productoEditandoId: string | null = null;
    private procesarCallback?: (id: string) => void;
    private cancelarCallback?: (id: string) => void;
    private filtrarCallback?: (filtros: any) => void;
    private buscarProductoCallback?: (texto: string) => void;
    private buscarCedulaCallback?: (cedula: string) => void;
    private guardarProductoCallback?: (producto: any) => void;
    private eliminarProductoCallback?: (id: string, accion: "delete" | "disable" | "enable") => void;
    private modalEl: HTMLElement | null;
    private modalInstance: any;
    private modalBody: HTMLElement | null;
    private modalConfirmEl: HTMLElement | null;
    private modalConfirmInstance: any;
    private modalConfirmBody: HTMLElement | null;
    private modalConfirmBtn: HTMLButtonElement | null;
    private modalDisableBtn: HTMLButtonElement | null;
    private modalDeleteBtn: HTMLButtonElement | null;
    private modalEnableBtn: HTMLButtonElement | null;
    private modalCancelBtn: HTMLButtonElement | null;
    private productoAEliminarId: string | null = null;

    constructor() {
        this.tablaPedidos = document.getElementById("tablaPedidos") as HTMLTableSectionElement;
        this.filtroEstado = document.getElementById("inFiltroEstado") as HTMLSelectElement;
        this.filtroMetodoPago = document.getElementById("inFiltroMetodoPago") as HTMLSelectElement;
        this.filtroFecha = document.getElementById("inFiltroFecha") as HTMLInputElement;
        this.filtroProducto = document.getElementById("inFiltroProducto") as HTMLSelectElement;
        this.tablaProductos = document.getElementById("tablaProductos") as HTMLTableSectionElement;
        this.formProducto = document.getElementById("formProducto") as HTMLFormElement;
        this.btnGuardarProducto = document.getElementById("btnGuardarProducto") as HTMLButtonElement;
        this.inputBuscarProducto = document.getElementById("inBuscarProducto") as HTMLInputElement;
        this.inputBuscarCedula = document.getElementById("inCedulaBuscar") as HTMLInputElement;
        this.btnBuscarCedula = document.getElementById("btnBuscarCedula") as HTMLButtonElement;
        this.spanTotalEfectivoBs = document.getElementById("spTotalEfectivoBs") as HTMLElement;
        this.spanTotalPagadoCliente = document.getElementById("spTotalPagadoCliente") as HTMLElement;
        this.modalEl = document.getElementById("adminAlertModal");
        this.modalBody = document.getElementById("adminAlertModalBody");
        this.modalConfirmEl = document.getElementById("adminConfirmModal");
        this.modalConfirmBody = document.getElementById("adminConfirmModalBody");
        this.modalConfirmBtn = document.getElementById("adminConfirmBtn") as HTMLButtonElement;
        this.modalDisableBtn = document.getElementById("adminConfirmDisableBtn") as HTMLButtonElement;
        this.modalDeleteBtn = document.getElementById("adminConfirmDeleteBtn") as HTMLButtonElement;
        this.modalCancelBtn = document.getElementById("adminCancelBtn") as HTMLButtonElement;
        this.modalEnableBtn = document.getElementById("adminConfirmEnableBtn") as HTMLButtonElement;

        this.filtroEstado.onchange = () => this.filtrarCallback?.({ estado: this.filtroEstado.value, metodoPago: this.filtroMetodoPago.value, producto: this.filtroProducto.value });
        this.filtroMetodoPago.onchange = () => this.filtrarCallback?.({ estado: this.filtroEstado.value, metodoPago: this.filtroMetodoPago.value, producto: this.filtroProducto.value });
        this.filtroFecha.onchange = () => this.filtrarCallback?.({ estado: this.filtroEstado.value, metodoPago: this.filtroMetodoPago.value, fecha: this.filtroFecha.value, producto: this.filtroProducto.value });
        this.filtroProducto.onchange = () => this.filtrarCallback?.({ estado: this.filtroEstado.value, metodoPago: this.filtroMetodoPago.value, fecha: this.filtroFecha.value, producto: this.filtroProducto.value });
        this.inputBuscarProducto.oninput = () => this.buscarProductoCallback?.(this.inputBuscarProducto.value);
        this.btnBuscarCedula.onclick = () => this.buscarCedulaCallback?.(this.inputBuscarCedula.value);
        this.formProducto.onsubmit = (e) => { e.preventDefault(); this.guardarProducto(); };
        this.btnGuardarProducto.onclick = () => this.guardarProducto();

        if (this.modalEl && (window as any).bootstrap) {
            this.modalInstance = new (window as any).bootstrap.Modal(this.modalEl);
        }
        if (this.modalConfirmEl && (window as any).bootstrap) {
            this.modalConfirmInstance = new (window as any).bootstrap.Modal(this.modalConfirmEl);
        }
        this.modalDeleteBtn?.addEventListener("click", () => {
            if (this.productoAEliminarId) {
                this.eliminarProductoCallback?.(this.productoAEliminarId, "delete");
            }
            this.modalConfirmInstance?.hide();
        });
        this.modalDisableBtn?.addEventListener("click", () => {
            if (this.productoAEliminarId) {
                this.eliminarProductoCallback?.(this.productoAEliminarId, "disable");
            }
            this.modalConfirmInstance?.hide();
        });
        this.modalEnableBtn?.addEventListener("click", () => {
            if (this.productoAEliminarId) {
                this.eliminarProductoCallback?.(this.productoAEliminarId, "enable");
            }
            this.modalConfirmInstance?.hide();
        });
        this.modalCancelBtn?.addEventListener("click", () => this.modalConfirmInstance?.hide());
    }

    mostrarPedidos(pedidos: any[]): void {
        this.tablaPedidos.innerHTML = "";
        pedidos.forEach(pedido => {
            const productosHtml = pedido.items.map((i: any) => `${i.nombre} x${i.cantidad}`).join("<br>");
            const fila = this.tablaPedidos.insertRow();
            fila.innerHTML = `
                <td>${pedido.id || ''}</td>
                <td>${pedido.nomCliente}</td>
                <td>${pedido.cedula || '—'}</td>
                <td>${productosHtml}</td>
                <td>${pedido.cantidadTotal()}</td>
                <td>$${pedido.total().toFixed(2)}</td>
                <td>${pedido.metodoPago}</td>
                <td>${Number(pedido.montoEntregado || 0).toFixed(2)}</td>
                <td>${pedido.detallesPago || '—'}</td>
                <td>${pedido.fecha || '—'}</td>
                <td class="${pedido.estado.toLowerCase()}">${pedido.estado}</td>
                <td><button class="btn btn-sm btn-success btn-procesar" data-id="${pedido.id}" ${pedido.estado !== 'Pendiente' ? 'disabled' : ''}>Procesar</button><button class="btn btn-sm btn-danger btn-cancelar" data-id="${pedido.id}" ${pedido.estado !== 'Pendiente' ? 'disabled' : ''}>Cancelar</button></td>
            `;
            const btn = fila.querySelector(".btn-procesar") as HTMLButtonElement;
            btn.onclick = () => this.procesarCallback?.(pedido.id);
            const btnCancelar = fila.querySelector(".btn-cancelar") as HTMLButtonElement;
            btnCancelar.onclick = () => this.cancelarCallback?.(pedido.id);
        });
    }

    mostrarProductos(productos: any[]): void {
        this.tablaProductos.innerHTML = "";
        productos.forEach(prod => {
            const cantidadSolicitada = Number(prod.cantidadSolicitada || 0);
            const porcentajeSolicitado = Number(prod.porcentajeSolicitado || 0);
            const fila = this.tablaProductos.insertRow();
            fila.innerHTML = `
                <td>${prod.codigo}</td>
                <td>${prod.nombre}</td>
                <td>${prod.categoria}</td>
                <td>$${Number(prod.precio || 0).toFixed(2)}</td>
                <td>${cantidadSolicitada}</td>
                <td>${porcentajeSolicitado.toFixed(1)}%</td>
                <td>
                    <button class="btn btn-sm btn-warning btn-editar" data-id="${prod.id}">Editar</button>
                    <button class="btn btn-sm btn-secondary btn-eliminar" data-id="${prod.id}">Disponibilidad</button>
                 </td>
            `;
            const btnEditar = fila.querySelector(".btn-editar") as HTMLButtonElement;
            const btnEliminar = fila.querySelector(".btn-eliminar") as HTMLButtonElement;
            btnEditar.onclick = () => this.editarProducto(prod);
            btnEliminar.onclick = () => this.confirmarEliminarProducto(prod.id, prod.nombre);
        });
    }

    private confirmarEliminarProducto(id: string, nombre: string) {
        this.productoAEliminarId = id;
        if (!this.modalConfirmBody || !this.modalConfirmInstance) return;
        this.modalConfirmBody.innerHTML = `¿Qué desea hacer con el producto "<strong>${nombre}</strong>"?<br><br>
            <div class="mb-0 ps-3">
                <strong>Eliminar</strong>: quitarlo de la base de datos.
                <br><strong>No disponible</strong>: el cliente ya no podrá verlo ni comprarlo.
                <br><strong>Disponible</strong>: el cliente podrá verlo y comprarlo nuevamente.
            </div>`;
        this.modalConfirmInstance.show();
    }

    editarProducto(prod: any) {
        (document.getElementById("prodCodigo") as HTMLInputElement).value = prod.codigo;
        (document.getElementById("prodNombre") as HTMLInputElement).value = prod.nombre;
        (document.getElementById("prodCategoria") as HTMLInputElement).value = prod.categoria;
        (document.getElementById("prodPrecio") as HTMLInputElement).value = prod.precio;
        this.productoEditandoId = prod.id;
    }

    guardarProducto() {
        const codigo = (document.getElementById("prodCodigo") as HTMLInputElement).value.trim();
        const nombre = (document.getElementById("prodNombre") as HTMLInputElement).value.trim();
        const categoria = (document.getElementById("prodCategoria") as HTMLInputElement).value.trim();
        const precio = parseFloat((document.getElementById("prodPrecio") as HTMLInputElement).value);
        if (!codigo || !nombre || !categoria || isNaN(precio)) {
            this.mostrarModal("warning", "Complete todos los campos correctamente");
            return;
        }
        this.guardarProductoCallback?.({ id: this.productoEditandoId, codigo, nombre, categoria, precio });
        this.formProducto.reset();
        this.productoEditandoId = null;
    }

    poblarFiltroProductos(nombres: string[]): void {
        while (this.filtroProducto.options.length > 1) {
            this.filtroProducto.remove(1);
        }
        nombres.forEach(nombre => {
            const option = document.createElement("option");
            option.value = nombre;
            option.textContent = nombre;
            this.filtroProducto.appendChild(option);
        });
    }

    onProcesarPedido(callback: (id: string) => void): void { this.procesarCallback = callback; }
    onCancelarPedido(callback: (id: string) => void): void { this.cancelarCallback = callback; }
    onFiltrarPedidos(callback: (filtros: any) => void): void { this.filtrarCallback = callback; }
    onBuscarProducto(callback: (texto: string) => void): void { this.buscarProductoCallback = callback; }
    onBuscarCedula(callback: (cedula: string) => void): void { this.buscarCedulaCallback = callback; }
    mostrarTotalEfectivoBS(total: number): void { this.spanTotalEfectivoBs.textContent = `Bs. ${total.toFixed(2)}`; }
    mostrarTotalPagadoCliente(total: number): void { this.spanTotalPagadoCliente.textContent = `$ ${total.toFixed(2)}`; }
    onGuardarProducto(callback: (producto: any) => void): void { this.guardarProductoCallback = callback; }
    onEliminarProducto(callback: (id: string, accion: "delete" | "disable" | "enable") => void): void { this.eliminarProductoCallback = callback; }

    mostrarModal(tipo: "success" | "danger" | "warning", mensaje: string): void {
        if (!this.modalInstance || !this.modalBody) return;
        this.modalBody.innerHTML = `<div class="text-${tipo}">${mensaje}</div>`;
        this.modalInstance.show();
        setTimeout(() => this.modalInstance.hide(), 1500);
    }
}