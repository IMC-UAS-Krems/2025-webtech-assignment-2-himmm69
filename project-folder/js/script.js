// -------------------- CART DATA --------------------
let cart = []; 
// cart items: { name: "...", price: 10, qty: 1 }

// -------------------- ADD TO CART --------------------
function addToCart(name, price) {
    // check if already in cart
    let item = cart.find(p => p.name === name);

    if (item) {
        item.qty++;
    } else {
        cart.push({ name, price, qty: 1 });
    }

    updateCartDisplay();
}

// -------------------- UPDATE CART ON SCREEN --------------------
function updateCartDisplay() {
    let cartList = document.getElementById("cart-list");
    let cartTotal = document.getElementById("cart-total");

    cartList.innerHTML = "";

    if (cart.length === 0) {
        cartList.innerHTML = "<li class='list-group-item'>Your cart is empty.</li>";
        cartTotal.innerText = "0.00";
        return;
    }

    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.qty;

        cartList.innerHTML += `
            <li class="list-group-item d-flex justify-content-between">
                ${item.name} (x${item.qty})
                - €${(item.price * item.qty).toFixed(2)}
            </li>
        `;
    });

    cartTotal.innerText = subtotal.toFixed(2);
}

// -------------------- SHOW CHECKOUT FORM --------------------
function goToCheckout() {
    document.getElementById("products-section").classList.add("d-none");
    document.getElementById("checkout-form").classList.remove("d-none");
    window.scrollTo(0, 0);
}

// -------------------- SUBMIT ORDER --------------------
function submitOrder(event) {
    event.preventDefault();

    let name = document.getElementById("buyer-name").value.trim();
    let email = document.getElementById("buyer-email").value.trim();
    let phone = document.getElementById("buyer-phone").value.trim();
    let address = document.getElementById("buyer-address").value.trim();

    if (!name || !email || !phone || !address) {
        alert("Please fill out all fields.");
        return;
    }

    // ---- calculate totals ----
    let subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    let discount = 0;
    let itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

    if (itemCount >= 3) {
        discount = subtotal * 0.10; // 10%
    }

    let afterDiscount = subtotal - discount;
    let tax = afterDiscount * 0.05; // 5%
    let total = afterDiscount + tax;

    // ---- show confirmation ----
    document.getElementById("checkout-form").classList.add("d-none");
    document.getElementById("confirmation").classList.remove("d-none");

    let details = document.getElementById("confirmation-details");

    details.innerHTML = `
        <h4>Order Summary</h4>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Address:</strong> ${address}</p>

        <h5 class="mt-3">Items:</h5>
        <ul>
            ${cart.map(item => 
                `<li>${item.name} x${item.qty} — €${(item.price * item.qty).toFixed(2)}</li>`
            ).join("")}
        </ul>

        <p>Subtotal: €${subtotal.toFixed(2)}</p>
        <p>Discount: -€${discount.toFixed(2)}</p>
        <p>Tax (5%): €${tax.toFixed(2)}</p>
        <h4>Total: €${total.toFixed(2)}</h4>
    `;
}

// -------------------- CONNECT BUTTONS TO JS --------------------
document.addEventListener("DOMContentLoaded", () => {
    let buttons = document.querySelectorAll(".add-to-cart");

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            let name = btn.dataset.name;
            let price = parseFloat(btn.dataset.price);
            addToCart(name, price);
        });
    });

    document.getElementById("checkout-btn").addEventListener("click", goToCheckout);
    document.getElementById("order-form").addEventListener("submit", submitOrder);
});
