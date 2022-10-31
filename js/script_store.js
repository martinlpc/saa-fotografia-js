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
let fetchedProducts = [];
// URLs de las "bases de datos" en archivos json locales
const URLproducts = "./js/product-database.json";
//
//  ---------------------------         ARRAY DEL CARRITO        ---------------------------  //
//
let cart = [];

//
//  ---------------------------         DOM ELEMENTS        ---------------------------  //
//
const loginEmail = document.getElementById("loginEmail"),
    loginPass = document.getElementById("loginPass"),
    remember = document.getElementById("rememberMe"),
    btnLogin = document.getElementById("btnLogin"),
    btnLogout = document.getElementById("btnLogout"),
    modalElem = document.getElementById("modalLogin"),
    modal = new bootstrap.Modal(modalElem),
    cardsContainer = document.getElementById("card-box"),
    filterCat = document.getElementById("filterCat"),
    toggles = document.querySelectorAll(".toggles"),
    btnItemToCart = document.querySelectorAll("button.btn-add-item"),
    contCart = document.getElementById("contCart"),
    btnCart = document.getElementById("btnCart"),
    cartBox = document.getElementById("cartBox");

//
//  ---------------------------         FLAGS Y CONST        ---------------------------  //
//
// Indica si el usuario se encuentra actualmente loggeado para operar en la tienda
let isUserLogged = false;

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
function saveInStorage(userCurrent, storage) {
    const user = {
        name: userCurrent.name,
        user: userCurrent.mail,
        pass: userCurrent.pass,
        cart: userCurrent.cart,
    };
    storage.setItem("user", JSON.stringify(userCurrent));
}

// Modifico el DOM para mostrar el nombre del usuario en <span id="nombreUser"></span>
function greetUser(user) {
    Swal.fire({
        icon: "success",
        title: "Hola " + user.name + " !",
        timer: 2000,
        timerProgressBar: true,
    });
    nombreUser.innerHTML = `Hola <em>${user.name}</em>!`;
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
        saveInStorage(user, sessionStorage);
        greetUser(user);
        toggleElem(toggles, "d-none");
        cart = [...user.cart];
        countCartItems();
    } else {
        isUserLogged = false;
    }
}

const fetchProducts = async () => {
    try {
        const response = await fetch(URLproducts);
        const data = await response.json();
        fetchedProducts = [...data];
        renderProducts(fetchedProducts, "all");
    } catch (err) {
        console.log(err.message);
    }
};

// Agrega (filtra) los items del store por categoria seleccionada
// Si se quiere listar TODOS los elementos del store, se envía el parámetro cat: all (value del select)
// ! LEVANTA LA INFO DE UN ARRAY PREVIAMENTE CARGADO DESDE EL JSON DE PRODUCTOS
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
    checkUserLogged(retrieveUserFromStorage(localStorage));
    fetchProducts();
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
            // Chequeamos si eligio recordar su sesion en el navegador del equipo
            remember.checked && saveInStorage(userData, localStorage);
            // Guardamos datos en el session siempre
            saveInStorage(userData, sessionStorage);
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
    // Se eliminan los datos de usuario de los storages
    eraseStorages();
    // Contador de items en carrito a cero
    contCart.innerHTML = "0";
    // Se ocultan los elementos del DOM correspondientes
    toggleElem(toggles, "d-none");
    // Bandera de usuario loggeado en false
    isUserLogged = false;
});

// Se dispara cuando se clickea en algun "añadir al carrito"
function addItemCart(event) {
    // Chequeamos si hay un usuario logueado
    if (isUserLogged) {
        // Obtenemos el id del producto en el attr 'item-id' de su button
        const itemID = event.target.getAttribute("item-id");
        // Chequeamos si ese elemento ya está agregado al carrito
        // "some" devuelve true si encuenta ese id en el carrito
        let itemAlreadyInCart = cart.some((elem) => elem.id == itemID);
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
            cart.push(fetchedProducts.find((elem) => elem.id == itemID));
            Toastify({
                text: "Producto agregado al carrito",
                duration: 2000,
                close: false,
                gravity: "top", // `top` or `bottom`
                position: "left", // `left`, `center` or `right`
                stopOnFocus: false, // Prevents dismissing of toast on hover
                style: {
                    background: "linear-gradient(to right, #00b09b, #96c93d)",
                },
            }).showToast();

            // ++contCart
            contCart.innerHTML = parseInt(contCart.innerHTML) + 1;
            let user = retrieveUserFromStorage(sessionStorage);
            user.cart = [...cart];
            saveInStorage(user, sessionStorage);
            remember.checked && saveInStorage(user, localStorage);
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

btnCart.onclick = () => {
    cartBox.classList.toggle("d-none");
};
