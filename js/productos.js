let productosDB = []; // Variable global para guardar los productos

// Función para mostrar el modal del carrito
function mostrarModalCarrito() {
    const modal = document.getElementById("modal-cart");
    const listaCarrito = document.getElementById("lista-cart");
    const totalCarrito = document.getElementById("total-cart");
    const carrito = JSON.parse(sessionStorage.getItem("cart")) || [];

    listaCarrito.innerHTML = "";

    if (carrito.length === 0) {
        listaCarrito.innerHTML = "<p style='text-align: center;'>No hay productos en el carrito.</p>";
        totalCarrito.textContent = "Total: $ 0.00";
    } else {
        let totalPrecio = 0;
       
        carrito.forEach((id) => {
            const producto = productosDB.find(p => p.id === id);
            if (!producto) return;
           
            totalPrecio += producto.cardmarket.prices.averageSellPrice;
           
            const item = document.createElement("div");
            item.className = "item-cart";
            item.innerHTML = `
                <span><strong>${producto.name}</strong></span>
                <span>$ ${producto.cardmarket.prices.averageSellPrice.toFixed(2)}</span>
            `;
            listaCarrito.appendChild(item);
        });
       
        totalCarrito.textContent = `Total: $ ${totalPrecio.toFixed(2)}`;
    }

    modal.style.display = "block";
}

 // Función para cerrar el modal
function cerrarModal() {
    document.getElementById("modal-cart").style.display = "none";
}

// Función para manejar clicks fuera del modal
function manejarClicksModal(event) {
    const modal = document.getElementById("modal-cart");
    if (event.target === modal || event.target.classList.contains("cerrar-cart")) {
        cerrarModal();
    }
}

// Función para actualizar el contador del carrito
function actualizarContadorCarrito() {
    const carrito = JSON.parse(sessionStorage.getItem("cart")) || [];
    const contador = document.getElementById("cartcount");
    const cartlink = document.getElementById("cartlink")

    if (contador) {
        // Actualizar el número
        contador.textContent = carrito.length > 9 ? "9+" : carrito.length;
       
        // Mostrar u ocultar según si hay productos
        if (carrito.length > 0) {
            cartlink.style.display = "list-item";
        } else {
            cartlink.style.display = "none";
        }
    }
}

// Función para agregar productos al carrito
function agregarAlCarrito(idProducto) {
    let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
    cart.push(idProducto);
    sessionStorage.setItem("cart", JSON.stringify(cart));
    actualizarContadorCarrito();
}

// Función para vaciar el carrito
function vaciarCarrito() {
    sessionStorage.removeItem("cart");
    actualizarContadorCarrito();
    cerrarModal();
}

// Función para preparar y redirigir a la página de pago
function pagar() {
    const carrito = JSON.parse(sessionStorage.getItem("cart")) || [];

    if (carrito.length === 0) {
        return;
    }

    // Preparar datos para la página de compra
    const productosCompra = [];
    let totalCompra = 0;

    carrito.forEach(id => {
        const producto = productosDB.find(p => p.id === id);
        if (producto) {
            productosCompra.push({
                nombre: producto.name,
                precio: producto.cardmarket.prices.averageSellPrice
            });
            totalCompra += producto.cardmarket.prices.averageSellPrice;
        }
    });

    // Guardar en sessionStorage
    sessionStorage.setItem('productos', JSON.stringify(productosCompra));
    sessionStorage.setItem('total', totalCompra.toFixed(2));

    // Redirigir a la página de compra
    window.location.href = 'carrito.html';
} 

// Inicialización cuando el DOM está listo
document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.getElementById("productos");

    fetch("https://api.pokemontcg.io/v2/cards?q=rarity:%22illustration%20rare%22+set.name:%22Paradox%20Rift%22")
        .then((response) => {
            if (!response.ok) throw new Error("Error en la red");
            return response.json();
        })
        .then((data) => {
            productosDB = data.data;
            contenedor.innerHTML = "";

            productosDB.forEach((producto) => {
                const item = document.createElement("div");
                item.className = "item";

                item.innerHTML = `
                        <h3>${producto.name}</h3>
                        <img src="${producto.images.small}" alt="Imagen de ${producto.name}">
                        <span class="precio">$ ${producto.cardmarket.prices.averageSellPrice.toFixed(2)}</span>
                        <button onclick="agregarAlCarrito('${producto.id}')">Comprar</button>
                `;

                contenedor.appendChild(item);
            });

            actualizarContadorCarrito();
        })
       
        .catch((error) => {
            console.error("Error al obtener productos:", error);
            contenedor.innerHTML = "<p><strong>Oh no!</strong> Hubo un problema. Intenté nuevamente.</p>";
        });
       
    // Event listeners
    document.getElementById("cart")?.addEventListener("click", mostrarModalCarrito);
    document.getElementById("vaciar-cart")?.addEventListener("click", vaciarCarrito);
    document.getElementById("pagar-cart")?.addEventListener("click", pagar);
    window.addEventListener("click", manejarClicksModal);
});