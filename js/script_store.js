//DB de usuarios fantasía
const usersDB = [
    {
        name: "Martin",
        mail: "martin@mail.com",
        pass: "passwordsuperseguro",
    },
    {
        name: "Sabri",
        mail: "sabrina@mail.com",
        pass: "conejito",
    },
    {
        name: "Alaska",
        mail: "alaska@mail.com",
        pass: "laperritadesabriymartin",
    },
];

const productsDB = [
    {
        id: "001",
        name: "Niños jugando",
        desc: "Niños jugando en el parque al sol",
        cat: "img",
        src_img: "...",
        precio: "100",
    },
    {
        id: "002",
        name: "Monte Fitz Roy",
        desc: "Vista del monte Fitz Roy en alta calidad",
        cat: "img",
        src_img: "...",
        precio: "200",
    },
    {
        id: "003",
        name: "E-book: Preparando tu prodcto antes de las fotos",
        desc: "Consejos y nociones de utilidad para preparar tu producto antes de publicitarlo",
        cat: "ebook",
        precio: "500",
    },
    {
        id: "004",
        name: "LightRoom Preset: Vintage 11",
        desc: "Añade",
        cat: "ebook",
        precio: "500",
    },
];

// DOM Elements
const loginMail = document.getElementById("loginEmail"),
    loginPass = document.getElementById("loginPass"),
    remember = document.getElementById("rememberMe"),
    btnLogin = document.getElementById("btnLogin"),
    modalElem = document.getElementById("modalLogin"),
    modal = new bootstrap.Modal(modalElem),
    cardsContainer = document.getElementById("card-box"),
    toggles = document.querySelectorAll(".toggles");

// Flag global que indica si el usuario está logueado
let isUserLogged = false;

// Valida si existe el usuario y devuelve el obj, sino, devuelve FALSE
function userValidate(database, user, pass) {
    let found = database.find((database) => database.mail == user);

    if (typeof found === undefined) {
        // Usuario no existe
        return false;
    } else {
        // Usuario existe, comprobamos password
        if (found.pass != pass) {
            return false;
        } else {
            return found;
        }
    }
}

// Guarda el usuario recuperado de la DB en el storage indicado
function saveOnStorage(userFromDB, storage) {
    const user = {
        name: userFromDB.name,
        user: userFromDB.mail,
        pass: userFromDB.pass,
    };
    storage.setItem("user", JSON.stringify(userFromDB));
}

// Modifico el DOM para mostrar el nombre del usuario en <span id="nombreUser"></span>
function greetUser(user) {
    nombreUser.innerHTML = `Bienvenido/a <em>${user.name}</em>`;
}

// Levanto el usuario guardado en el storage indicado
function retrieveUserFromStorage(storage) {
    let user = JSON.parse(storage.getitem("user"));
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
        greetUser(user);
        // funciones adicionales a crear para users registrados
    }
}

// Agrega (filtra) los items del store por categoria seleccionada
// Si se quiere listar TODOS los elementos del store, se envía el parámetro cat: todasp
function addCardsByCat(array, cat) {
    // Limpio el contenedor de las cards para tenerlo en cero
    cardsContainer.innerHTML = "";

    // Chequeo si se pidió una cat específica o todas
    if (cat != "todas") {
        // Armo un array con los elementos de la cat indicada
        const arrayFilt = array.filter((elem) => elem.cat == cat);

        arrayFilt.foreach((elem) => {
            let html = `<article class="col-12 col-md-6 col-lg-3 card">
                    <img src="${elem.src_img}" class="card-img-top" alt="...">
                    <div class="card-body">
                        <p class="card-title">${elem.name}</p>
                        <p class="card-text">${elem.desc}</p>
                        <p class="card-text">Precio: $${elem.precio}</p>
                        <a href="#" class="btn btn-add-item">Agregar al carrito</a>
                    </div>
                </article>`;

            cardsContainer += html;
        });
    } else {
        // Se eligió mostrar todas las categorías
        array.foreach((elem) => {
            let html = `<article class="col-12 col-md-6 col-lg-3 card">
                <img src="${elem.src_img}" class="card-img-top" alt="...">
                <div class="card-body">
                    <p class="card-title">${elem.name}</p>
                    <p class="card-text">${elem.desc}</p>
                    <p class="card-text">Precio: $${elem.precio}</p>
                    <a href="#" class="btn btn-add-item">Agregar al carrito</a>
                </div>
            </article>`;

            cardsContainer += html;
        });
    }
}
