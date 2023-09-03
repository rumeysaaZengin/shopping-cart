// !api (mockapi)
// https://64eb4bb0e51e1e82c5772f4e.mockapi.io/products
// resimlerin sayısı mockapi'den çoğaltıldı.

//* HTML'den Aldıklarımız.
const cartBtn = document.querySelector(".cart-btn");
const clearCartBtn = document.querySelector(".btn-clear");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".total-value");
const cartContent = document.querySelector(".cart-list");
const productsDOM = document.querySelector("#products-dom");

//* Butonlar
let buttonsDOM = [];
//*Cart
let cart = [];

class Products {
    async getProducts() {
        try {
            // api'a istek atıldı
            let result = await fetch(
                "https://64eb4bb0e51e1e82c5772f4e.mockapi.io/products"
            );
            // api'dan gelen cevap Json'a dönüştürüldü
            let data = await result.json();
            let products = data;
            return products;
        } catch (error) {
            console.log(error);
        }
    }
}

class UI {
    // ürünleri ekrana aktaracak fonksiyon
    displayProducts(products) {
        let result = "";
        products.forEach((item) => {
            result += `
        <div class="col-lg-4 col-md-6">
            <div class="product">
                <div class="product-image">
                     <img src="${item.image}" alt="product" />
                </div>
                <div class="product-hover">
                    <span class="product-title">${item.title}</span>
                    <span class="product-price"> $${item.price}</span>
                    <button class="btn-add-to-cart" data-id=${item.id}>
                        <i class="fas fa-cart-shopping"></i>
                    </button>
                </div>
            </div>
        </div>
        `;
        });
        productsDOM.innerHTML = result;
    }
    saveCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map((item) => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        cartTotal.innerText = "$" + parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }
    //
    getBagButtons() {
        // cartlarda bulunan ekleme butonlarının hepsine dizi şeklinde ulaşma
        const buttons = [...document.querySelectorAll(".btn-add-to-cart")];
        buttonsDOM = buttons;
        // butonları dönme
        buttons.forEach((button) => {
            let id = button.dataset.id;
            let inCart = cart.find((item) => item.id === id);
            if (inCart) {
                button.setAttribute("disabled", "disabled");
                button.opacity = ".3";
            } else {
                button.addEventListener("click", (event) => {
                    event.target.disabled = true;
                    event.target.style.opacity = ".3";
                    // get product from products
                    let cartItem = { ...Storage.getProduct(id), amount: 1 };
                    // add product to the card
                    cart = [...cart, cartItem];
                    // save cart localstorage
                    Storage.saveCart(cart);
                    // save cart value
                    this.saveCartValues(cart);
                    // display cart item
                    this.addCardItem(cartItem);
                    // show the cart
                    this.showCart();
                });
            }
        });
    }
    addCardItem(item) {
        const li = document.createElement("li");
        li.classList.add("cart-list-item");
        li.innerHTML = `
            <div class="cart-left">
                <div class="cart-left-image">
                  <img src=${item.image} alt="product" />
                </div>
                <div class="cart-left-info">
                  <a href="#" class="cart-left-info-title">${item.title}</a>
                  <span class="cart-left-info-price">$${item.price}</span>
                </div>
            </div>
            <div class="cart-right">
                <div class="cart-right-quantity">
                    <button class="quantity-minus" data-id=${item.id}>
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity">${item.amount}</span>
                    <button class="quantity-plus" data-id=${item.id}>
                        <i class="fas fa-plus"></i>
                    </button>
                 </div>
            <div class="cart-right-remove">
                  <button class="cart-remove-btn" data-id=${item.id}>
                    <i class="fas fa-trash"></i>
                  </button>
            </div>
            </div>
    `;
        cartContent.appendChild(li);
    }
    showCart() {
        cartBtn.click();
    }
    setupApp() {
        cart = Storage.getCart();
        this.saveCartValues(cart);
        this.populateCart(cart);
    }
    populateCart(cart) {
        cart.forEach((item) => this.addCardItem(item));
    }
    cartLogic() {
        clearCartBtn.addEventListener("click", () => {
            this.clearCart();
        });
        cartContent.addEventListener("click", (e) => {
            if (e.target.classList.contains("cart-remove-btn")) {
                let removeItem = e.target;
                let id = removeItem.dataset.id;
                removeItem.parentElement.parentElement.parentElement.remove();
                this.removeItem(id);
            } else if (e.target.classList.contains("quantity-minus")) {
                let lowerAmount = e.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find((item) => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if (tempItem.amount > 0) {
                    Storage.saveCart(cart);
                    this.saveCartValues(cart);
                    lowerAmount.nextElementSibling.innerText = tempItem.amount;
                } else {
                    lowerAmount.parentElement.parentElement.parentElement.remove();
                    this.removeItem(id);
                }
            } else if (e.target.classList.contains("quantity-plus")) {
                let addAmount = e.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find((item) => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.saveCartValues(cart);
                addAmount.previousElementSibling.innerText = tempItem.amount;
            }
        });
    }
    clearCart() {
        let cartItems = cart.map((item) => item.id);
        cartItems.forEach((id) => this.removeItem(id));
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
    }
    removeItem(id) {
        cart = cart.filter((item) => item.id !== id);
        this.saveCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSinleButton(id);
        button.disabled = false;
        button.style.opacity = "";
    }
    getSinleButton(id) {
        return buttonsDOM.find((button) => button.dataset.id === id);
    }
}

class Storage {
    // static yazmamızın sebebi new ile tekrardan tanımlamamak içindir.
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProduct(id) {
        let product = JSON.parse(localStorage.getItem("products"));
        return product.find((product) => product.id === id);
    }
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    static getCart() {
        return localStorage.getItem("cart")
            ? JSON.parse(localStorage.getItem("cart"))
            : [];
    }
}

//* Sayfa yüklendiği anda çalışacak
document.addEventListener("DOMContentLoaded", () => {
    // class'ların örnekleri oluşturuldu
    const ui = new UI();
    const products = new Products();

    ui.setupApp();
    // products class'ından gelen verileri yakalayıp
    //UI class'ında bulunan displayProducts fonksiyonuna gönderildi.
    // UI class'ında bulunan getBagButtons çalıştırıldı.
    products
        .getProducts()
        .then((products) => {
            ui.displayProducts(products);
            Storage.saveProducts(products);
        })
        .then(() => {
            ui.getBagButtons();
            ui.cartLogic();
        });
});

