//
//  ---------------------------         DB USARIOS        ---------------------------  //
//
const usersDB = [
    {
        name: "Martin",
        mail: "martin@mail.com",
        pass: "1234",
        cart: [],
    },
    {
        name: "Sabrina",
        mail: "sabrina@mail.com",
        pass: "qwerty",
        cart: [],
    },
];
//
//  ---------------------------         DB PRODUCTOS        ---------------------------  //
//
// * Array de destino donde se van a guardar los datos fetched desde el json
// * Los productos son de única instancia, se simplifica usando array en vez de objeto
let fetchedProducts = [];
// URLs de las "bases de datos" en archivos json locales
const URL_PRODUCTS = "./js/product-database.json";
//
//  ---------------------------         ARRAY DEL CARRITO        ---------------------------  //

let cart = [];

//
//  ---------------------------         DOM ELEMENTS        ---------------------------  //
//
const loginEmail = document.getElementById("loginEmail");
const loginPass = document.getElementById("loginPass");
const remember = document.getElementById("rememberMe");
const btnLogin = document.getElementById("btnLogin");
const btnLogout = document.getElementById("btnLogout");
const modalElem = document.getElementById("modalLogin");
const modal = new bootstrap.Modal(modalElem);
const cardsContainer = document.getElementById("card-box");
const filterCat = document.getElementById("filterCat");
const toggles = document.querySelectorAll(".toggles");
const btnItemToCart = document.querySelectorAll("button.btn-add-item");
const contCart = document.getElementById("contCart");
const btnCart = document.getElementById("btnCart");
const cartBox = document.querySelector(".box-cart");
const cartItems = document.querySelector("#cart-items");
const cartFooter = document.querySelector("#footer-cart");
const boxBtnCart = document.querySelector("#box-btn-cart");

//
//  ---------------------------         FLAGS Y CONST        ---------------------------  //
//
// Indica si el usuario se encuentra actualmente loggeado para operar en la tienda
let isUserLogged = false;
// Acumulador para suma de precio total
let totalPrice = 0;

//
//  ---------------------------         FUNCIONES        ---------------------------  //
//
// Valida si existe el usuario y devuelve el obj, sino, devuelve FALSE
function validateUser(user, pass) {
    let found = usersDB.find((userInDB) => userInDB.mail == user);
    let response;
    typeof found === "undefined" ? (response = false) : found.pass != pass ? (response = false) : (response = found);
    return response;
}

// Guarda el usuario recuperado de la DB en el storage indicado
function saveInStorage(userCurrent) {
    const user = {
        name: userCurrent.name,
        user: userCurrent.mail,
        pass: userCurrent.pass,
        cart: userCurrent.cart,
    };
    remember.checked && localStorage.setItem("user", JSON.stringify(userCurrent));
    sessionStorage.setItem("user", JSON.stringify(userCurrent));
}

// Modifico el DOM para mostrar el nombre del usuario en <span id="nombreUser"></span>
function greetUser(user) {
    Swal.fire({
        icon: "success",
        title: "¡Hola " + user.name + " !",
        timer: 2000,
        timerProgressBar: true,
    });
    nombreUser.innerHTML = `${user.name}`;
}

// Levanto el usuario guardado en el storage indicado
function retrieveUserFromStorage(storage) {
    let user = JSON.parse(storage.getItem("user"));
    return user;
}

// Limpiar storages
function eraseStorages() {
    localStorage.clear();
    sessionStorage.clear();
}

// Chequeo si el usuario está guardado para recordarlo en la proxima sesion
// Si es así, evitamos el proceso de login manual e ingresamos directo
function checkUserLogged(user) {
    if (user) {
        isUserLogged = true;
        remember.checked = true;
        saveInStorage(user);
        greetUser(user);
        toggleElem(toggles, "d-none");
        cart = [...user.cart];
        renderCart();
    } else {
        isUserLogged = false;
    }
}

// fetch a la DB de productos para cargarlos en array
const fetchProducts = async () => {
    try {
        const response = await fetch(URL_PRODUCTS);
        const data = await response.json();
        fetchedProducts = [...data];
        renderProducts(fetchedProducts, "all");
    } catch (err) {
        Toastify({
            text: "Error al leer DB productos: " + err.message,
            style: {
                background: "#ff0000",
            },
        }).showToast();
    }
};

// Agrega (filtra) los items del store por categoria seleccionada
// Si se quiere listar TODOS los elementos del store, se envía el parámetro cat: all (value del select)
// * LEVANTA LA INFO DE UN ARRAY PREVIAMENTE CARGADO DESDE EL JSON DE PRODUCTOS
function renderProducts(arrayData, cat) {
    // Limpiamos el contenedor de las cards de los productos
    cardsContainer.innerHTML = "";
    // Definimos un array temporal con el filtrado, o no, de las categorías
    let arrayTemp = [];
    // Chequeo si se pidió una cat específica o todas
    cat != "all" ? (arrayTemp = arrayData.filter((el) => el.cat == cat)) : (arrayTemp = Array.from(arrayData));

    arrayTemp.forEach((elem) => {
        // Estructura
        const myNode = document.createElement("article");
        myNode.classList.add("card", "col-12", "col-md-6", "col-lg-3", "text-center");
        // Imagen
        const myNodeImg = document.createElement("img");
        myNodeImg.classList.add("img-fluid", "card-img-top");
        myNodeImg.setAttribute("src", elem.src_img);
        // Body
        const myNodeCardBody = document.createElement("div");
        myNodeCardBody.classList.add("card-body");
        // Titulo
        const myNodeTitle = document.createElement("p");
        myNodeTitle.classList.add("card-title");
        myNodeTitle.textContent = elem.name;
        // Texto descriptivo
        const myNodeDesc = document.createElement("p");
        myNodeDesc.classList.add("card-text");
        myNodeDesc.textContent = elem.desc;
        // Precio
        const myNodePrice = document.createElement("p");
        myNodePrice.classList.add("card-text");
        myNodePrice.textContent = `$${elem.price}`;
        // Boton de añadir al carro
        const myNodeButton = document.createElement("button");
        myNodeButton.classList.add("btn", "btn-add-item");
        myNodeButton.textContent = "Agregar al carrito";
        myNodeButton.setAttribute("item-id", elem.id);
        myNodeButton.addEventListener("click", addItemCart);
        // Generamos htmls e insertamos
        myNodeCardBody.appendChild(myNodeTitle);
        myNodeCardBody.appendChild(myNodeDesc);
        myNodeCardBody.appendChild(myNodePrice);
        myNodeCardBody.appendChild(myNodeButton);
        myNode.appendChild(myNodeImg);
        myNode.appendChild(myNodeCardBody);
        cardsContainer.appendChild(myNode);
    });
}

// Función que muestra o oculta un grupo de elementos del DOM usando el param toggleClass
function toggleElem(DomElems, toggleClass) {
    DomElems.forEach((elem) => {
        elem.classList.toggle(toggleClass);
    });
}

function countCartItems() {
    contCart.innerHTML = cart.length;
}

// Renderiza el carrito
const renderCart = () => {
    // reset del carrito
    cartItems.innerHTML = "";
    cartFooter.innerHTML = "";
    totalPrice = 0;
    // Armado de los rows de la tabla
    // Usando nodos para poder agregar un listener en el boton eliminar prod del carrito
    cart.forEach((elem) => {
        // Creamos la fila/row del item a agregar
        const myNode = document.createElement("tr");
        // Contenedor del thumbnail
        const myNodeBoxThumbnail = document.createElement("td");
        // Imagen
        const myNodeThumbnail = document.createElement("img");
        myNodeThumbnail.setAttribute("src", elem.src_img);
        myNodeThumbnail.classList.add("cart-thumb");
        // Contenedor del nombre
        const myNodeBoxName = document.createElement("td");
        // Nombre
        const myNodeName = document.createElement("span");
        myNodeName.textContent = elem.name;
        // Boton de borrar del carro
        const myNodeBoxAnchor = document.createElement("td");
        myNodeBoxAnchor.classList.add("remove-item-btn");
        const myNodeAnchor = document.createElement("a");
        myNodeAnchor.setAttribute("href", "#");
        myNodeAnchor.setAttribute("item-id", elem.id);
        myNodeAnchor.addEventListener("click", removeItemCart);
        const myNodeButton = document.createElement("i");
        myNodeButton.classList.add("fa-regular", "fa-trash-can");
        myNodeButton.setAttribute("item-id", elem.id);
        // Contenedor del precio
        const myNodeBoxPrice = document.createElement("td");
        // Precio
        const myNodePrice = document.createElement("span");
        myNodePrice.innerHTML = `$${elem.price}`;
        // Anidamos elementos hijos directos del row
        myNode.append(myNodeBoxThumbnail);
        myNode.append(myNodeBoxName);
        myNode.append(myNodeBoxAnchor);
        myNode.append(myNodeBoxPrice);
        // Anidamos elementos hijos de cada contenedor
        myNodeBoxThumbnail.append(myNodeThumbnail);
        myNodeBoxName.append(myNodeName);
        myNodeBoxAnchor.append(myNodeAnchor);
        myNodeAnchor.append(myNodeButton);
        myNodeBoxPrice.append(myNodePrice);
        // Insertamos el row en la tabla
        /*  ESTRUCTURA FINAL A INSERTAR
                <tr>
                    <td><img></img></td>
                    <td><span></span></td>
                    <td><a><i></i></a></td>
                    <td><span></span></td>
                </tr>
            */
        cartItems.append(myNode);

        totalPrice += parseFloat(elem.price);
    });
    countCartItems();
    // Armado del footer de la tabla con el precio total
    if (parseInt(contCart.innerText) > 0) {
        // Creo el footer con totales a través de innerHTML
        cartFooter.innerHTML = `
            <tr>
                <th class="text-center" scope="row" colspan="3">
                    <span>Total productos:</span>
                </th>
                <td>
                    <span>${contCart.innerText}</span>
                </td>
            </tr>
            <tr>
                <th class="text-center" scope="row" colspan="3">
                    <span>Precio total:</span>
                </th>
                <td>
                    <span>$ ${totalPrice}</span>
                </td>
            </tr>
        `;
        // Creo los btn de vaciar y comprar con nodos para agregar los eventos
        if (boxBtnCart.innerHTML == "") {
            const nodeBtnClearCart = document.createElement("button");
            nodeBtnClearCart.classList.add("btn", "btn-danger", "btn-sm");
            nodeBtnClearCart.addEventListener("click", clearCart);
            nodeBtnClearCart.innerText = "Vaciar carrito";

            const nodeBtnCheckout = document.createElement("button");
            nodeBtnCheckout.classList.add("btn", "btn-success", "btn-sm");
            nodeBtnCheckout.addEventListener("click", checkout);
            nodeBtnCheckout.innerText = "Comprar";

            boxBtnCart.append(nodeBtnClearCart);
            boxBtnCart.append(nodeBtnCheckout);
        }
    } else {
        cartFooter.innerHTML = `
            <tr>
                <th class="text-center" scope="row" colspan="4">
                    <span>Carrito vacío</span>
                </th>
            </tr>                
        `;
        boxBtnCart.innerHTML = "";
    }
};

//
//  ---------------------------         EVENTOS        ---------------------------  //
//

// Evento captura el item en el filtro de categorias
filterCat.addEventListener("change", (e) => {
    renderProducts(fetchedProducts, e.target.value);
});

// Cargamos el store con los productos del array al abrir la pag
// y chequeamos si hay un user en local que decidio ser recordado
window.onload = () => {
    fetchProducts();
    checkUserLogged(retrieveUserFromStorage(localStorage));
};

btnLogin.addEventListener("click", (e) => {
    // Evitamos que el modal se cierre por
    // la acción del click
    e.preventDefault();
    // Chequeo de campos vacíos
    if (!loginEmail.value || !loginPass.value) {
        Swal.fire({
            title: "Complete ambos campos",
            icon: "warning",
        });
    } else {
        // Validamos si el usuario existe o no
        // validateUser() devuelve false o el obj del user
        let userData = validateUser(loginEmail.value, loginPass.value);
        if (!userData) {
            Swal.fire({
                title: "Usuario y/o contraseña incorrecto(s)",
                icon: "error",
            });
        } else {
            saveInStorage(userData);
            greetUser(retrieveUserFromStorage(sessionStorage));
            userData.cart.forEach((elem) => {
                cart.push(elem);
                contCart.innerHTML = parseInt(contCart.innerHTML) + 1;
            });

            // Ahora se cierra el modal
            modal.hide();
            toggleElem(toggles, "d-none");
            isUserLogged = true;
        }
    }
});

btnLogout.addEventListener("click", () => {
    Swal.fire({
        icon: "warning",
        title: "¿Estás seguro/a?",
        text: "¡Vas a desloguearte y perder el contenido de tu carrito!",
        showCancelButton: true,
        confirmButtonText: "Logout",
        cancelButtonText: "Cancelar",
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire("¡Adiós!");
            cart = [];
            // Se eliminan los datos de usuario de los storages
            eraseStorages();
            renderCart();
            countCartItems();
            // Se ocultan los elementos del DOM correspondientes
            toggleElem(toggles, "d-none");
            // El carrito se oculta en una instrucción separada ya que no está en el grupo de toggles
            !cartBox.classList.contains("d-none") && cartBox.classList.add("d-none");
            // Bandera de usuario loggeado en false
            isUserLogged = false;
        }
    });
});

// Se dispara cuando se clickea en algun "añadir al carrito"
function addItemCart(event) {
    // Chequeamos si hay un usuario logueado
    if (isUserLogged) {
        // Obtenemos el id del producto en el attr 'item-id' de su button
        const itemID = event.target.getAttribute("item-id");
        // Chequeamos si ese elemento ya está agregado al carrito
        // "some" devuelve true si encuenta ese id en el carrito
        let itemAlreadyInCart = cart.some((elem) => elem.id === itemID);
        if (itemAlreadyInCart) {
            Toastify({
                text: "Este producto ya está en el carrito",
                duration: 2000,
                close: false,
                gravity: "top", // `top` or `bottom`
                position: "left", // `left`, `center` or `right`
                stopOnFocus: false, // Prevents dismissing of toast on hover
                style: {
                    background: "linear-gradient(to left, #00b09b, #96c93d)",
                },
            }).showToast();
        } else {
            cart.push(fetchedProducts.find((elem) => elem.id === itemID));
            renderCart();
            Toastify({
                text: "Producto agregado al carrito",
                duration: 2000,
                close: false,
                gravity: "bottom", // `top` or `bottom`
                position: "right", // `left`, `center` or `right`
                stopOnFocus: false, // Prevents dismissing of toast on hover
                style: {
                    background: "linear-gradient(to right, #00b09b, #96c93d)",
                },
            }).showToast();
            let user = retrieveUserFromStorage(sessionStorage);
            user.cart = [...cart];
            saveInStorage(user);
        }
    } else {
        Toastify({
            text: "Inicia sesión para poder comprar",
            duration: 5000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "center", // `left`, `center` or `right`
            stopOnFocus: false, // Prevents dismissing of toast on hover
            style: {
                background: "linear-gradient(to left, #00b09b, #96c93d)",
            },
        }).showToast();
    }
}

// Muestra o esconde el carrito
btnCart.onclick = () => {
    cartBox.classList.toggle("d-none");
};

const removeItemCart = (event) => {
    const itemID = event.target.getAttribute("item-id");
    // Buscamos el ID en el carrito para encontrar en que posicion esta
    const itemIndex = cart.findIndex((elem) => elem.id == itemID);
    // Borramos el item del carrito (solo si el index existe, para evitar errores)
    itemIndex > -1 && cart.splice(itemIndex, 1);
    // Actualizamos el cart en el storage
    const user = retrieveUserFromStorage(sessionStorage);
    user.cart.length = 0;
    user.cart = [...cart];
    saveInStorage(user);
    renderCart();
};

const clearCart = (event) => {
    Swal.fire({
        icon: "warning",
        title: "¿Estás seguro/a?",
        text: "¡Vas a vaciar tu carrito de compra!",
        showCancelButton: true,
        confirmButtonText: "Vaciar",
        cancelButtonText: "Cancelar",
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire("Vaciaste tu carrito ☹");
            cart = [];
            const user = retrieveUserFromStorage(sessionStorage);
            user.cart.length = 0;
            saveInStorage(user);
            renderCart();
        }
    });
};

const checkout = (event) => {
    Swal.fire({
        icon: "question",
        title: "¿Procedemos?",
        text: "Vas a comprar por un total de $ " + totalPrice,
        showCancelButton: true,
        cancelButtonText: "Esperá! Todavía no!",
        confirmButtonText: "¡Si! ¡Compro!",
    }).then((result) => {
        if (result.isConfirmed) {
            cart = [];
            const user = retrieveUserFromStorage(sessionStorage);
            user.cart.length = 0;
            saveInStorage(user);
            renderCart();
            Swal.fire({
                icon: "success",
                title: "¡Gracias por tu compra! 😃",
            });
        } else {
            Swal.fire({
                icon: "info",
                title: "Cancelaste el proceso de compra",
            });
        }
    });
};
