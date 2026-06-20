import I_vAdmin from "../interfaces/I_vAdmin.js";

export default class Cl_vAdmin implements I_vAdmin {
    private container: HTMLElement;
    private tablaPedidos: HTMLTableSectionElement;
    private filtroEstado: HTMLSelectElement;
    private filtroMetodoPago: HTMLSelectElement;
    private filtroFecha: HTMLInputElement;
    private filtroProducto: HTMLSelectElement;
    private tablaProductos: HTMLTableSectionElement;
    private inputBuscarProducto: HTMLInputElement;
    private inputBuscarCedula: HTMLInputElement;
    private inputBuscarPorCodigo: HTMLInputElement;
    private spanTotalEfectivoBs: HTMLElement;
    private spanTotalPagadoCliente: HTMLElement;
    private productoEditandoId: string | null = null;
    private modalInstance: any;
    private modalConfirmInstance: any;
    private productoModalInstance: any;

    // modal de producto
    private productoModal: HTMLElement;
    private productoModalLabel: HTMLElement;
    private prodCodigoInput: HTMLInputElement;
    private prodNombreInput: HTMLInputElement;
    private prodCategoriaInput: HTMLInputElement;
    private prodPrecioInput: HTMLInputElement;
    private btnGuardarProductoModal: HTMLButtonElement;
    private btnAgregarProducto: HTMLButtonElement;

    // reportes
    private txtProductoMasVendido: HTMLElement;
    private txtProductoMasVendidoDetalle: HTMLElement;
    private txtProductoMayorIngreso: HTMLElement;
    private txtProductoMayorIngresoDetalle: HTMLElement;
    private selectAnalisisProducto: HTMLSelectElement;
    private txtUnidadesProducto: HTMLElement;
    private txtIngresoProducto: HTMLElement;

    // callbacks
    private procesarCallback?: (id: string) => void;
    private cancelarCallback?: (id: string) => void;
    private filtrarCallback?: (filtros: any) => void;
    private buscarProductoCallback?: (texto: string) => void;
    private buscarPorCodigoCallback?: (codigo: string) => void;
    private buscarCedulaCallback?: (cedula: string) => void;
    private guardarProductoCallback?: (producto: any) => void;
    private eliminarProductoCallback?: (id: string, accion: "delete" | "disable" | "enable") => void;
    private productoAEliminarId: string | null = null;
    private analisisProductoCallback?: (codigo: string) => void;

    constructor() {
        this.container = document.getElementById("adminPanel") as HTMLElement;
        this.tablaPedidos = document.getElementById("tablaPedidos") as HTMLTableSectionElement;
        this.filtroEstado = document.getElementById("inFiltroEstado") as HTMLSelectElement;
        this.filtroMetodoPago = document.getElementById("inFiltroMetodoPago") as HTMLSelectElement;
        this.filtroFecha = document.getElementById("inFiltroFecha") as HTMLInputElement;
        this.filtroProducto = document.getElementById("inFiltroProducto") as HTMLSelectElement;
        this.tablaProductos = document.getElementById("tablaProductos") as HTMLTableSectionElement;
        this.inputBuscarProducto = document.getElementById("inBuscarProducto") as HTMLInputElement;
        this.inputBuscarCedula = document.getElementById("inCedulaBuscar") as HTMLInputElement;
        this.inputBuscarPorCodigo = document.getElementById("inBuscarPorCodigo") as HTMLInputElement;
        this.spanTotalEfectivoBs = document.getElementById("spTotalEfectivoBs") as HTMLElement;
        this.spanTotalPagadoCliente = document.getElementById("spTotalPagadoCliente") as HTMLElement;

        // reportes
        this.txtProductoMasVendido = document.getElementById("txtProductoMasVendido") as HTMLElement;
        this.txtProductoMasVendidoDetalle = document.getElementById("txtProductoMasVendidoDetalle") as HTMLElement;
        this.txtProductoMayorIngreso = document.getElementById("txtProductoMayorIngreso") as HTMLElement;
        this.txtProductoMayorIngresoDetalle = document.getElementById("txtProductoMayorIngresoDetalle") as HTMLElement;
        this.selectAnalisisProducto = document.getElementById("selectAnalisisProducto") as HTMLSelectElement;
        this.txtUnidadesProducto = document.getElementById("txtUnidadesProducto") as HTMLElement;
        this.txtIngresoProducto = document.getElementById("txtIngresoProducto") as HTMLElement;

        // modal de producto
        this.productoModal = document.getElementById("productoModal") as HTMLElement;
        this.productoModalLabel = document.getElementById("productoModalLabel") as HTMLElement;
        this.prodCodigoInput = document.getElementById("prodCodigoModal") as HTMLInputElement;
        this.prodNombreInput = document.getElementById("prodNombreModal") as HTMLInputElement;
        this.prodCategoriaInput = document.getElementById("prodCategoriaModal") as HTMLInputElement;
        this.prodPrecioInput = document.getElementById("prodPrecioModal") as HTMLInputElement;
        this.btnGuardarProductoModal = document.getElementById("btnGuardarProductoModal") as HTMLButtonElement;
        this.btnAgregarProducto = document.getElementById("btnAgregarProducto") as HTMLButtonElement;

        // modales de Bootstrap
        if ((window as any).bootstrap) {
            const bs = (window as any).bootstrap;
            this.modalInstance = new bs.Modal(document.getElementById("adminAlertModal") as HTMLElement);
            this.modalConfirmInstance = new bs.Modal(document.getElementById("adminConfirmModal") as HTMLElement);
            this.productoModalInstance = new bs.Modal(this.productoModal);
        }

        // eventos
        this.filtroEstado.onchange = () => this.filtrarCallback?.({
            estado: this.filtroEstado.value,
            metodoPago: this.filtroMetodoPago.value,
            fecha: this.filtroFecha.value,
            producto: this.filtroProducto.value,
        });
        this.filtroMetodoPago.onchange = () => this.filtrarCallback?.({
            estado: this.filtroEstado.value,
            metodoPago: this.filtroMetodoPago.value,
            fecha: this.filtroFecha.value,
            producto: this.filtroProducto.value,
        });
        this.filtroFecha.onchange = () => this.filtrarCallback?.({
            estado: this.filtroEstado.value,
            metodoPago: this.filtroMetodoPago.value,
            fecha: this.filtroFecha.value,
            producto: this.filtroProducto.value,
        });
        this.filtroProducto.onchange = () => this.filtrarCallback?.({
            estado: this.filtroEstado.value,
            metodoPago: this.filtroMetodoPago.value,
            fecha: this.filtroFecha.value,
            producto: this.filtroProducto.value,
        });
        this.inputBuscarProducto.oninput = () => this.buscarProductoCallback?.(this.inputBuscarProducto.value);
        this.inputBuscarPorCodigo.oninput = () => this.buscarPorCodigoCallback?.(this.inputBuscarPorCodigo.value);
        this.inputBuscarCedula.oninput = () => this.buscarCedulaCallback?.(this.inputBuscarCedula.value);

        // botón agregar producto
        this.btnAgregarProducto.onclick = () => this.abrirModalProducto();

        // botón guardar del modal
        this.btnGuardarProductoModal.onclick = () => this.guardarProductoDesdeModal();

        // análisis de producto
        this.selectAnalisisProducto.addEventListener("change", () => {
            const codigo = this.selectAnalisisProducto.value;
            if (codigo && this.analisisProductoCallback) {
                this.analisisProductoCallback(codigo);
            } else {
                this.txtUnidadesProducto.textContent = "0";
                this.txtIngresoProducto.textContent = "$0.00";
            }
        });

        // botones de confirmación de disponibilidad
        document.getElementById("adminConfirmDeleteBtn")?.addEventListener("click", () => {
            if (this.productoAEliminarId) {
                this.eliminarProductoCallback?.(this.productoAEliminarId, "delete");
            }
            this.modalConfirmInstance?.hide();
        });
        document.getElementById("adminConfirmDisableBtn")?.addEventListener("click", () => {
            if (this.productoAEliminarId) {
                this.eliminarProductoCallback?.(this.productoAEliminarId, "disable");
            }
            this.modalConfirmInstance?.hide();
        });
        document.getElementById("adminConfirmEnableBtn")?.addEventListener("click", () => {
            if (this.productoAEliminarId) {
                this.eliminarProductoCallback?.(this.productoAEliminarId, "enable");
            }
            this.modalConfirmInstance?.hide();
        });
        document.getElementById("adminCancelBtn")?.addEventListener("click", () => this.modalConfirmInstance?.hide());

        // limpiar modal al cerrar
        this.productoModal.addEventListener("hidden.bs.modal", () => {
            this.limpiarFormularioProducto();
        });
    }

    // métodos del modal de producto
    private abrirModalProducto(datos?: any): void {
        if (datos) {
            this.productoModalLabel.textContent = "Editar Producto";
            this.prodCodigoInput.value = datos.codigo || "";
            this.prodNombreInput.value = datos.nombre || "";
            this.prodCategoriaInput.value = datos.categoria || "";
            this.prodPrecioInput.value = datos.precio || "";
            this.productoEditandoId = datos.id || null;
        } else {
            this.productoModalLabel.textContent = "Agregar Producto";
            this.limpiarFormularioProducto();
            this.productoEditandoId = null;
        }
        this.productoModalInstance?.show();
    }

    private limpiarFormularioProducto(): void {
        this.prodCodigoInput.value = "";
        this.prodNombreInput.value = "";
        this.prodCategoriaInput.value = "";
        this.prodPrecioInput.value = "";
    }

    private guardarProductoDesdeModal(): void {
        const codigo = this.prodCodigoInput.value.trim();
        const nombre = this.prodNombreInput.value.trim();
        const categoria = this.prodCategoriaInput.value.trim();
        const precio = parseFloat(this.prodPrecioInput.value);
        if (!codigo || !nombre || !categoria || isNaN(precio)) {
            this.mostrarModal("warning", "Complete todos los campos correctamente");
            return;
        }
        this.guardarProductoCallback?.({
            id: this.productoEditandoId,
            codigo,
            nombre,
            categoria,
            precio,
        });
        this.productoModalInstance?.hide();
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
                <td>$${pedido.total().toFixed(2)}</td>
                <td>${pedido.metodoPago}</td>
                <td>${pedido.detallesPago || '—'}</td>
                <td>${pedido.fecha || '—'}</td>
                <td class="${pedido.estado.toLowerCase()}">${pedido.estado}</td>
                <td>
                    <button class="btn btn-sm btn-success btn-procesar" data-id="${pedido.id}" ${pedido.estado !== 'Pendiente' ? 'disabled' : ''}>Procesar</button>
                    <button class="btn btn-sm btn-danger btn-cancelar" data-id="${pedido.id}" ${pedido.estado !== 'Pendiente' ? 'disabled' : ''}>Cancelar</button>
                </td>
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
            const ingresoTotal = Number(prod.ingresoTotal || 0);
            const fila = this.tablaProductos.insertRow();
            fila.innerHTML = `
                <td>${prod.codigo}</td>
                <td>${prod.nombre}</td>
                <td>${prod.categoria}</td>
                <td>$${Number(prod.precio || 0).toFixed(2)}</td>
                <td>${cantidadSolicitada}</td>
                <td>$${ingresoTotal.toFixed(2)}</td>
                <td>${porcentajeSolicitado.toFixed(1)}%</td>
                <td>
                    <button class="btn btn-sm btn-warning btn-editar" data-id="${prod.id}">Editar</button>
                    <button class="btn btn-sm btn-danger btn-eliminar" data-id="${prod.id}">Disponibilidad</button>
                </td>
            `;
            const btnEditar = fila.querySelector(".btn-editar") as HTMLButtonElement;
            const btnEliminar = fila.querySelector(".btn-eliminar") as HTMLButtonElement;
            btnEditar.onclick = () => this.abrirModalProducto(prod);
            btnEliminar.onclick = () => this.confirmarEliminarProducto(prod.id, prod.nombre);
        });
    }

    mostrarTotalEfectivoBS(total: number): void {
        this.spanTotalEfectivoBs.textContent = `Bs. ${total.toFixed(2)}`;
    }

    mostrarTotalPagadoCliente(total: number): void {
        this.spanTotalPagadoCliente.textContent = `$ ${total.toFixed(2)}`;
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

    mostrarModal(tipo: "success" | "danger" | "warning", mensaje: string): void {
        if (!this.modalInstance) return;
        const modalBody = document.getElementById("adminAlertModalBody");
        if (modalBody) {
            modalBody.innerHTML = `<div class="text-${tipo}">${mensaje}</div>`;
        }
        this.modalInstance.show();
        setTimeout(() => this.modalInstance.hide(), 1500);
    }

    mostrarProductoMasVendido(producto: any, unidades: number): void {
        if (producto) {
            this.txtProductoMasVendido.textContent = `${producto.nombre}`;
            this.txtProductoMasVendidoDetalle.textContent = `Unidades: ${unidades}`;
        } else {
            this.txtProductoMasVendido.textContent = "—";
            this.txtProductoMasVendidoDetalle.textContent = "Sin datos";
        }
    }

    mostrarProductoMayorIngreso(producto: any, ingreso: number): void {
        if (producto) {
            this.txtProductoMayorIngreso.textContent = `${producto.nombre}`;
            this.txtProductoMayorIngresoDetalle.textContent = `Ingreso total: $${ingreso.toFixed(2)}`;
        } else {
            this.txtProductoMayorIngreso.textContent = "—";
            this.txtProductoMayorIngresoDetalle.textContent = "Sin datos";
        }
    }

    mostrarTotalRecaudadoHoy(total: number): void {
        const el = document.getElementById("totalRecaudadoHoy");
        if (el) {
            el.textContent = `$${total.toFixed(2)}`;
        }
    }

    poblarSelectAnalisisProducto(productos: any[]): void {
        this.selectAnalisisProducto.innerHTML = '<option value="">Seleccione un producto...</option>';
        productos.forEach(prod => {
            const option = document.createElement("option");
            option.value = prod.codigo;
            option.textContent = `${prod.nombre} (${prod.codigo})`;
            this.selectAnalisisProducto.appendChild(option);
        });
    }

    mostrarEstadisticasProducto(unidades: number, ingreso: number): void {
        this.txtUnidadesProducto.textContent = unidades.toString();
        this.txtIngresoProducto.textContent = `$${ingreso.toFixed(2)}`;
    }

    // Callbacks
    onProcesarPedido(callback: (id: string) => void): void { this.procesarCallback = callback; }
    onCancelarPedido(callback: (id: string) => void): void { this.cancelarCallback = callback; }
    onFiltrarPedidos(callback: (filtros: any) => void): void { this.filtrarCallback = callback; }
    onBuscarProducto(callback: (texto: string) => void): void { this.buscarProductoCallback = callback; }
    onBuscarPorCodigo(callback: (codigo: string) => void): void { this.buscarPorCodigoCallback = callback; }
    onBuscarCedula(callback: (cedula: string) => void): void { this.buscarCedulaCallback = callback; }
    onGuardarProducto(callback: (producto: any) => void): void { this.guardarProductoCallback = callback; }
    onEliminarProducto(callback: (id: string, accion: "delete" | "disable" | "enable") => void): void {
        this.eliminarProductoCallback = callback;
    }
    onAnalisisProducto(callback: (codigo: string) => void): void {
        this.analisisProductoCallback = callback;
    }

    mostrar(): void { this.container.removeAttribute("hidden"); }
    ocultar(): void { this.container.setAttribute("hidden", "true"); }

    private confirmarEliminarProducto(id: string, nombre: string): void {
        this.productoAEliminarId = id;
        const modalBody = document.getElementById("adminConfirmModalBody");
        if (!modalBody || !this.modalConfirmInstance) return;
        modalBody.innerHTML = `¿Qué desea hacer con el producto "<strong>${nombre}</strong>"?<br><br>
            <div class="mb-0 ps-3">
                <strong>Eliminar</strong>: quitarlo de la base de datos.
                <br><strong>No disponible</strong>: el cliente ya no podrá verlo ni comprarlo.
                <br><strong>Disponible</strong>: el cliente podrá verlo y comprarlo nuevamente.
            </div>`;
        this.modalConfirmInstance.show();
    }
}