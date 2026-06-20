export default class Cl_vAdmin {
    container;
    tablaPedidos;
    filtroEstado;
    filtroMetodoPago;
    filtroFecha;
    filtroProducto;
    tablaProductos;
    inputBuscarProducto;
    inputBuscarCedula;
    inputBuscarPorCodigo;
    spanTotalEfectivoBs;
    spanTotalPagadoCliente;
    productoEditandoId = null;
    modalInstance;
    modalConfirmInstance;
    productoModalInstance;
    // modal de producto
    productoModal;
    productoModalLabel;
    prodCodigoInput;
    prodNombreInput;
    prodCategoriaInput;
    prodPrecioInput;
    btnGuardarProductoModal;
    btnAgregarProducto;
    // reportes
    txtProductoMasVendido;
    txtProductoMasVendidoDetalle;
    txtProductoMayorIngreso;
    txtProductoMayorIngresoDetalle;
    selectAnalisisProducto;
    txtUnidadesProducto;
    txtIngresoProducto;
    // callbacks
    procesarCallback;
    cancelarCallback;
    filtrarCallback;
    buscarProductoCallback;
    buscarPorCodigoCallback;
    buscarCedulaCallback;
    guardarProductoCallback;
    eliminarProductoCallback;
    productoAEliminarId = null;
    analisisProductoCallback;
    constructor() {
        this.container = document.getElementById("adminPanel");
        this.tablaPedidos = document.getElementById("tablaPedidos");
        this.filtroEstado = document.getElementById("inFiltroEstado");
        this.filtroMetodoPago = document.getElementById("inFiltroMetodoPago");
        this.filtroFecha = document.getElementById("inFiltroFecha");
        this.filtroProducto = document.getElementById("inFiltroProducto");
        this.tablaProductos = document.getElementById("tablaProductos");
        this.inputBuscarProducto = document.getElementById("inBuscarProducto");
        this.inputBuscarCedula = document.getElementById("inCedulaBuscar");
        this.inputBuscarPorCodigo = document.getElementById("inBuscarPorCodigo");
        this.spanTotalEfectivoBs = document.getElementById("spTotalEfectivoBs");
        this.spanTotalPagadoCliente = document.getElementById("spTotalPagadoCliente");
        // reportes
        this.txtProductoMasVendido = document.getElementById("txtProductoMasVendido");
        this.txtProductoMasVendidoDetalle = document.getElementById("txtProductoMasVendidoDetalle");
        this.txtProductoMayorIngreso = document.getElementById("txtProductoMayorIngreso");
        this.txtProductoMayorIngresoDetalle = document.getElementById("txtProductoMayorIngresoDetalle");
        this.selectAnalisisProducto = document.getElementById("selectAnalisisProducto");
        this.txtUnidadesProducto = document.getElementById("txtUnidadesProducto");
        this.txtIngresoProducto = document.getElementById("txtIngresoProducto");
        // modal de producto
        this.productoModal = document.getElementById("productoModal");
        this.productoModalLabel = document.getElementById("productoModalLabel");
        this.prodCodigoInput = document.getElementById("prodCodigoModal");
        this.prodNombreInput = document.getElementById("prodNombreModal");
        this.prodCategoriaInput = document.getElementById("prodCategoriaModal");
        this.prodPrecioInput = document.getElementById("prodPrecioModal");
        this.btnGuardarProductoModal = document.getElementById("btnGuardarProductoModal");
        this.btnAgregarProducto = document.getElementById("btnAgregarProducto");
        // modales de Bootstrap
        if (window.bootstrap) {
            const bs = window.bootstrap;
            this.modalInstance = new bs.Modal(document.getElementById("adminAlertModal"));
            this.modalConfirmInstance = new bs.Modal(document.getElementById("adminConfirmModal"));
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
            }
            else {
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
    abrirModalProducto(datos) {
        if (datos) {
            this.productoModalLabel.textContent = "Editar Producto";
            this.prodCodigoInput.value = datos.codigo || "";
            this.prodNombreInput.value = datos.nombre || "";
            this.prodCategoriaInput.value = datos.categoria || "";
            this.prodPrecioInput.value = datos.precio || "";
            this.productoEditandoId = datos.id || null;
        }
        else {
            this.productoModalLabel.textContent = "Agregar Producto";
            this.limpiarFormularioProducto();
            this.productoEditandoId = null;
        }
        this.productoModalInstance?.show();
    }
    limpiarFormularioProducto() {
        this.prodCodigoInput.value = "";
        this.prodNombreInput.value = "";
        this.prodCategoriaInput.value = "";
        this.prodPrecioInput.value = "";
    }
    guardarProductoDesdeModal() {
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
    mostrarPedidos(pedidos) {
        this.tablaPedidos.innerHTML = "";
        pedidos.forEach(pedido => {
            const productosHtml = pedido.items.map((i) => `${i.nombre} x${i.cantidad}`).join("<br>");
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
            const btn = fila.querySelector(".btn-procesar");
            btn.onclick = () => this.procesarCallback?.(pedido.id);
            const btnCancelar = fila.querySelector(".btn-cancelar");
            btnCancelar.onclick = () => this.cancelarCallback?.(pedido.id);
        });
    }
    mostrarProductos(productos) {
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
            const btnEditar = fila.querySelector(".btn-editar");
            const btnEliminar = fila.querySelector(".btn-eliminar");
            btnEditar.onclick = () => this.abrirModalProducto(prod);
            btnEliminar.onclick = () => this.confirmarEliminarProducto(prod.id, prod.nombre);
        });
    }
    mostrarTotalEfectivoBS(total) {
        this.spanTotalEfectivoBs.textContent = `Bs. ${total.toFixed(2)}`;
    }
    mostrarTotalPagadoCliente(total) {
        this.spanTotalPagadoCliente.textContent = `$ ${total.toFixed(2)}`;
    }
    poblarFiltroProductos(nombres) {
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
    mostrarModal(tipo, mensaje) {
        if (!this.modalInstance)
            return;
        const modalBody = document.getElementById("adminAlertModalBody");
        if (modalBody) {
            modalBody.innerHTML = `<div class="text-${tipo}">${mensaje}</div>`;
        }
        this.modalInstance.show();
        setTimeout(() => this.modalInstance.hide(), 1500);
    }
    mostrarProductoMasVendido(producto, unidades) {
        if (producto) {
            this.txtProductoMasVendido.textContent = `${producto.nombre}`;
            this.txtProductoMasVendidoDetalle.textContent = `Unidades: ${unidades}`;
        }
        else {
            this.txtProductoMasVendido.textContent = "—";
            this.txtProductoMasVendidoDetalle.textContent = "Sin datos";
        }
    }
    mostrarProductoMayorIngreso(producto, ingreso) {
        if (producto) {
            this.txtProductoMayorIngreso.textContent = `${producto.nombre}`;
            this.txtProductoMayorIngresoDetalle.textContent = `Ingreso total: $${ingreso.toFixed(2)}`;
        }
        else {
            this.txtProductoMayorIngreso.textContent = "—";
            this.txtProductoMayorIngresoDetalle.textContent = "Sin datos";
        }
    }
    mostrarTotalRecaudadoHoy(total) {
        const el = document.getElementById("totalRecaudadoHoy");
        if (el) {
            el.textContent = `$${total.toFixed(2)}`;
        }
    }
    poblarSelectAnalisisProducto(productos) {
        this.selectAnalisisProducto.innerHTML = '<option value="">Seleccione un producto...</option>';
        productos.forEach(prod => {
            const option = document.createElement("option");
            option.value = prod.codigo;
            option.textContent = `${prod.nombre} (${prod.codigo})`;
            this.selectAnalisisProducto.appendChild(option);
        });
    }
    mostrarEstadisticasProducto(unidades, ingreso) {
        this.txtUnidadesProducto.textContent = unidades.toString();
        this.txtIngresoProducto.textContent = `$${ingreso.toFixed(2)}`;
    }
    // Callbacks
    onProcesarPedido(callback) { this.procesarCallback = callback; }
    onCancelarPedido(callback) { this.cancelarCallback = callback; }
    onFiltrarPedidos(callback) { this.filtrarCallback = callback; }
    onBuscarProducto(callback) { this.buscarProductoCallback = callback; }
    onBuscarPorCodigo(callback) { this.buscarPorCodigoCallback = callback; }
    onBuscarCedula(callback) { this.buscarCedulaCallback = callback; }
    onGuardarProducto(callback) { this.guardarProductoCallback = callback; }
    onEliminarProducto(callback) {
        this.eliminarProductoCallback = callback;
    }
    onAnalisisProducto(callback) {
        this.analisisProductoCallback = callback;
    }
    mostrar() { this.container.removeAttribute("hidden"); }
    ocultar() { this.container.setAttribute("hidden", "true"); }
    confirmarEliminarProducto(id, nombre) {
        this.productoAEliminarId = id;
        const modalBody = document.getElementById("adminConfirmModalBody");
        if (!modalBody || !this.modalConfirmInstance)
            return;
        modalBody.innerHTML = `¿Qué desea hacer con el producto "<strong>${nombre}</strong>"?<br><br>
            <div class="mb-0 ps-3">
                <strong>Eliminar</strong>: quitarlo de la base de datos.
                <br><strong>No disponible</strong>: el cliente ya no podrá verlo ni comprarlo.
                <br><strong>Disponible</strong>: el cliente podrá verlo y comprarlo nuevamente.
            </div>`;
        this.modalConfirmInstance.show();
    }
}
//# sourceMappingURL=Cl_vAdmin.js.map