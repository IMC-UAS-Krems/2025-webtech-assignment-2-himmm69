
let cart = []; 

function addToCart(name, price) {
  if (!name || isNaN(price)) return; 
  let item = cart.find(p => p.name === name);
  if (item) item.qty++;
  else cart.push({ name, price: Number(price), qty: 1 });
  updateCartDisplay();
}


function updateCartDisplay() {
  const cartList = document.getElementById("cart-list");
  const cartTotal = document.getElementById("cart-total");
  if (!cartList || !cartTotal) return;
  cartList.innerHTML = "";
  if (cart.length === 0) {
    cartList.innerHTML = "<li class='list-group-item'>Your cart is empty.</li>";
    cartTotal.innerText = "0.00";
    return;
  }
  let subtotal = 0;
  cart.forEach(item => {
    subtotal += item.price * item.qty;
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `<span>${item.name} (x${item.qty})</span><span>€${(item.price * item.qty).toFixed(2)}</span>`;
    cartList.appendChild(li);
  });
  cartTotal.innerText = subtotal.toFixed(2);
}

function goToCheckout() {
  const prod = document.getElementById("products-section");
  const form = document.getElementById("checkout-form");
  if (prod) prod.classList.add("d-none");
  if (form) form.classList.remove("d-none");
  window.scrollTo(0, 0);
}


function submitOrder(event) {
  event.preventDefault();
  const name = document.getElementById("buyer-name")?.value.trim() || "";
  const email = document.getElementById("buyer-email")?.value.trim() || "";
  const phone = document.getElementById("buyer-phone")?.value.trim() || "";
  const address = document.getElementById("buyer-address")?.value.trim() || "";
  if (!name || !email || !phone || !address) {
    alert("Please fill out all required fields.");
    return;
  }

  const subtotal = cart.reduce((s, it) => s + it.price * it.qty, 0);
  const itemCount = cart.reduce((s, it) => s + it.qty, 0);
  const discount = itemCount >= 3 ? subtotal * 0.10 : 0;
  const afterDiscount = subtotal - discount;
  const tax = afterDiscount * 0.05;
  const total = afterDiscount + tax;

  document.getElementById("checkout-form")?.classList.add("d-none");
  document.getElementById("confirmation")?.classList.remove("d-none");

  const details = document.getElementById("confirmation-details");
  if (!details) return;
  details.innerHTML = `
    <h4>Order Summary</h4>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Address:</strong> ${address}</p>
    <h5 class="mt-3">Items:</h5>
    <ul>
      ${cart.map(it => `<li>${it.name} x${it.qty} — €${(it.price * it.qty).toFixed(2)}</li>`).join("")}
    </ul>
    <p>Subtotal: €${subtotal.toFixed(2)}</p>
    <p>Discount: -€${discount.toFixed(2)}</p>
    <p>Tax (5%): €${tax.toFixed(2)}</p>
    <h4>Total: €${total.toFixed(2)}</h4>
  `;

  cart = [];
  updateCartDisplay();
}


document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.addEventListener("click", () => {
      let name = btn.dataset.name;
      let price = btn.dataset.price;
      if ((!name || !price) && btn.closest(".card")) {
        const card = btn.closest(".card");
        name = name || card.querySelector(".card-title")?.textContent?.trim();
        const priceText = card.querySelector(".fw-bold")?.textContent?.trim() || "";
        if (!price) {
          const m = priceText.match(/([\d,.]+)/);
          price = m ? m[1].replace(",", ".") : NaN;
        }
      }
      price = parseFloat(price);
      if (!name || isNaN(price)) {
        console.warn("Invalid product data for add-to-cart:", name, price);
        return;
      }
      addToCart(name, price);
    });
  });

  document.getElementById("checkout-btn")?.addEventListener("click", goToCheckout);
  document.getElementById("order-form")?.addEventListener("submit", submitOrder);


  updateCartDisplay();
});