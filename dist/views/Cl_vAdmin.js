export default class Cl_vAdmin {
    tablaPedidos;
    filtroEstado;
    filtroMetodoPago;
    filtroFecha;
    filtroProducto;
    tablaProductos;
    formProducto;
    btnGuardarProducto;
    inputBuscarProducto;
    inputBuscarCedula;
    btnBuscarCedula;
    spanTotalEfectivoBs;
    spanTotalPagadoCliente;
    productoEditandoId = null;
    procesarCallback;
    cancelarCallback;
    filtrarCallback;
    buscarProductoCallback;
    buscarCedulaCallback;
    guardarProductoCallback;
    eliminarProductoCallback;
    modalEl;
    modalInstance;
    modalBody;
    modalConfirmEl;
    modalConfirmInstance;
    modalConfirmBody;
    modalConfirmBtn;
    modalDisableBtn;
    modalDeleteBtn;
    modalEnableBtn;
    modalCancelBtn;
    productoAEliminarId = null;
    constructor() {
        this.tablaPedidos = document.getElementById("tablaPedidos");
        this.filtroEstado = document.getElementById("inFiltroEstado");
        this.filtroMetodoPago = document.getElementById("inFiltroMetodoPago");
        this.filtroFecha = document.getElementById("inFiltroFecha");
        this.filtroProducto = document.getElementById("inFiltroProducto");
        this.tablaProductos = document.getElementById("tablaProductos");
        this.formProducto = document.getElementById("formProducto");
        this.btnGuardarProducto = document.getElementById("btnGuardarProducto");
        this.inputBuscarProducto = document.getElementById("inBuscarProducto");
        this.inputBuscarCedula = document.getElementById("inCedulaBuscar");
        this.btnBuscarCedula = document.getElementById("btnBuscarCedula");
        this.spanTotalEfectivoBs = document.getElementById("spTotalEfectivoBs");
        this.spanTotalPagadoCliente = document.getElementById("spTotalPagadoCliente");
        this.modalEl = document.getElementById("adminAlertModal");
        this.modalBody = document.getElementById("adminAlertModalBody");
        this.modalConfirmEl = document.getElementById("adminConfirmModal");
        this.modalConfirmBody = document.getElementById("adminConfirmModalBody");
        this.modalConfirmBtn = document.getElementById("adminConfirmBtn");
        this.modalDisableBtn = document.getElementById("adminConfirmDisableBtn");
        this.modalDeleteBtn = document.getElementById("adminConfirmDeleteBtn");
        this.modalCancelBtn = document.getElementById("adminCancelBtn");
        this.modalEnableBtn = document.getElementById("adminConfirmEnableBtn");
        this.filtroEstado.onchange = () => this.filtrarCallback?.({ estado: this.filtroEstado.value, metodoPago: this.filtroMetodoPago.value, producto: this.filtroProducto.value });
        this.filtroMetodoPago.onchange = () => this.filtrarCallback?.({ estado: this.filtroEstado.value, metodoPago: this.filtroMetodoPago.value, producto: this.filtroProducto.value });
        this.filtroFecha.onchange = () => this.filtrarCallback?.({ estado: this.filtroEstado.value, metodoPago: this.filtroMetodoPago.value, fecha: this.filtroFecha.value, producto: this.filtroProducto.value });
        this.filtroProducto.onchange = () => this.filtrarCallback?.({ estado: this.filtroEstado.value, metodoPago: this.filtroMetodoPago.value, fecha: this.filtroFecha.value, producto: this.filtroProducto.value });
        this.inputBuscarProducto.oninput = () => this.buscarProductoCallback?.(this.inputBuscarProducto.value);
        this.btnBuscarCedula.onclick = () => this.buscarCedulaCallback?.(this.inputBuscarCedula.value);
        this.formProducto.onsubmit = (e) => { e.preventDefault(); this.guardarProducto(); };
        this.btnGuardarProducto.onclick = () => this.guardarProducto();
        if (this.modalEl && window.bootstrap) {
            this.modalInstance = new window.bootstrap.Modal(this.modalEl);
        }
        if (this.modalConfirmEl && window.bootstrap) {
            this.modalConfirmInstance = new window.bootstrap.Modal(this.modalConfirmEl);
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
                <td>${pedido.cantidadTotal()}</td>
                <td>$${pedido.total().toFixed(2)}</td>
                <td>${pedido.metodoPago}</td>
                <td>${Number(pedido.montoEntregado || 0).toFixed(2)}</td>
                <td>${pedido.detallesPago || '—'}</td>
                <td>${pedido.fecha || '—'}</td>
                <td class="${pedido.estado.toLowerCase()}">${pedido.estado}</td>
                <td><button class="btn btn-sm btn-success btn-procesar" data-id="${pedido.id}" ${pedido.estado !== 'Pendiente' ? 'disabled' : ''}>Procesar</button><button class="btn btn-sm btn-danger btn-cancelar" data-id="${pedido.id}" ${pedido.estado !== 'Pendiente' ? 'disabled' : ''}>Cancelar</button></td>
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
            const btnEditar = fila.querySelector(".btn-editar");
            const btnEliminar = fila.querySelector(".btn-eliminar");
            btnEditar.onclick = () => this.editarProducto(prod);
            btnEliminar.onclick = () => this.confirmarEliminarProducto(prod.id, prod.nombre);
        });
    }
    confirmarEliminarProducto(id, nombre) {
        this.productoAEliminarId = id;
        if (!this.modalConfirmBody || !this.modalConfirmInstance)
            return;
        this.modalConfirmBody.innerHTML = `¿Qué desea hacer con el producto "<strong>${nombre}</strong>"?<br><br>
            <div class="mb-0 ps-3">
                <strong>Eliminar</strong>: quitarlo de la base de datos.
                <br><strong>No disponible</strong>: el cliente ya no podrá verlo ni comprarlo.
                <br><strong>Disponible</strong>: el cliente podrá verlo y comprarlo nuevamente.
            </div>`;
        this.modalConfirmInstance.show();
    }
    editarProducto(prod) {
        document.getElementById("prodCodigo").value = prod.codigo;
        document.getElementById("prodNombre").value = prod.nombre;
        document.getElementById("prodCategoria").value = prod.categoria;
        document.getElementById("prodPrecio").value = prod.precio;
        this.productoEditandoId = prod.id;
    }
    guardarProducto() {
        const codigo = document.getElementById("prodCodigo").value.trim();
        const nombre = document.getElementById("prodNombre").value.trim();
        const categoria = document.getElementById("prodCategoria").value.trim();
        const precio = parseFloat(document.getElementById("prodPrecio").value);
        if (!codigo || !nombre || !categoria || isNaN(precio)) {
            this.mostrarModal("warning", "Complete todos los campos correctamente");
            return;
        }
        this.guardarProductoCallback?.({ id: this.productoEditandoId, codigo, nombre, categoria, precio });
        this.formProducto.reset();
        this.productoEditandoId = null;
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
    onProcesarPedido(callback) { this.procesarCallback = callback; }
    onCancelarPedido(callback) { this.cancelarCallback = callback; }
    onFiltrarPedidos(callback) { this.filtrarCallback = callback; }
    onBuscarProducto(callback) { this.buscarProductoCallback = callback; }
    onBuscarCedula(callback) { this.buscarCedulaCallback = callback; }
    mostrarTotalEfectivoBS(total) { this.spanTotalEfectivoBs.textContent = `Bs. ${total.toFixed(2)}`; }
    mostrarTotalPagadoCliente(total) { this.spanTotalPagadoCliente.textContent = `$ ${total.toFixed(2)}`; }
    onGuardarProducto(callback) { this.guardarProductoCallback = callback; }
    onEliminarProducto(callback) { this.eliminarProductoCallback = callback; }
    mostrarModal(tipo, mensaje) {
        if (!this.modalInstance || !this.modalBody)
            return;
        this.modalBody.innerHTML = `<div class="text-${tipo}">${mensaje}</div>`;
        this.modalInstance.show();
        setTimeout(() => this.modalInstance.hide(), 1500);
    }
}
//# sourceMappingURL=Cl_vAdmin.js.map