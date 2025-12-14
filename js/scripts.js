let cart = []; // items dict
// toast is a dom for notification messages
function showToast(message, icon = "✅") {
  const toastEl = document.getElementById("live-toast");
  if (!toastEl) {
    console.warn("showToast: #live-toast not found");
    return;
  }

// ensuring  placeholders exist
  let msgEl = toastEl.querySelector("#toast-message");
  let iconEl = toastEl.querySelector("#toast-icon");
  if (!msgEl) {
    msgEl = document.createElement("span");
    msgEl.id = "toast-message";
    toastEl.querySelector(".toast-body")?.appendChild(msgEl);
  }

  // ensuring icon exixts 
  if (!iconEl) {
    iconEl = document.createElement("span");
    iconEl.id = "toast-icon";
    toastEl.querySelector(".toast-body")?.insertBefore(iconEl, msgEl);
  }
  iconEl.textContent = icon;
  msgEl.textContent = message;

  // use getOrCreateInstance for stability of toast
  const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 3000, autohide: true });
  console.log("showToast:", message);
  toast.show();
}

// check discount eligibility
let _discountTimeout = null;
function checkAndShowDiscountToast() {
  const itemCount = cart.reduce((s, it) => s + it.qty, 0);
  console.log("checkAndShowDiscountToast: itemCount=", itemCount, "discountNotified=", discountNotified);

  if (itemCount >= 3 && !discountNotified) {
    discountNotified = true; // mark immediately so we don't schedule multiples
    // small delay so the "added to cart" toast can appear first
    if (_discountTimeout) clearTimeout(_discountTimeout);
    _discountTimeout = setTimeout(() => {
      showToast("🎉 Yay — you're eligible for a 10% discount now!", "🎉");
      _discountTimeout = null;
    }, 350);
  } else if (itemCount < 3 && discountNotified) {
    // allow future notification if items go below 3
    discountNotified = false;
    if (_discountTimeout) { clearTimeout(_discountTimeout); _discountTimeout = null; }
  }
}

// add product to cart
function addToCart(name, price) {
  if (!name || isNaN(price)) return;
  let item = cart.find(p => p.name === name);
  if (item) item.qty++;
  else cart.push({ name, price: Number(price), qty: 1 });
  updateCartDisplay();
  showToast(`${name} (x${cart.find(p => p.name === name).qty}) added to cart`, "🛒");
  checkAndShowDiscountToast();
}

// update cart 
function updateCartDisplay() {
  const cartList = document.getElementById("cart-list");
  const cartTotal = document.getElementById("cart-total");
  const checkoutBtn = document.getElementById("checkout-btn");
  if (!cartList || !cartTotal) return;
  cartList.innerHTML = "";
  if (cart.length === 0) {
    cartList.innerHTML = "<li class='list-group-item'>Your cart is empty.</li>";
    cartTotal.innerText = "0.00";
    // reset discount notification when cart empty
    discountNotified = false;
    if (checkoutBtn) checkoutBtn.disabled = true; // disable checkout when cart empty
    return;
  }
  // find subtotal 
  let subtotal = 0;
  cart.forEach(item => {
    subtotal += item.price * item.qty;
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `<span>${item.name} (x${item.qty})</span><span>€${(item.price * item.qty).toFixed(2)}</span>`;
    cartList.appendChild(li);
  });
  cartTotal.innerText = subtotal.toFixed(2);

  // enable checkout if cart has items if no items then no checkout
  if (checkoutBtn) checkoutBtn.disabled = false;

  // check discount eligibility each time cart updates
  checkAndShowDiscountToast();
}

// block going to checkout if cart empty
function goToCheckout() {
  if (cart.length === 0) {
    showToast("Your cart is empty — add items before checkout.", "⚠️");
    return;
  }
  const prod = document.getElementById("products-section");
  const form = document.getElementById("checkout-form");
  if (prod) prod.classList.add("d-none");
  if (form) form.classList.remove("d-none");
  window.scrollTo(0, 0);
}

// submiting order 
function submitOrder(event) {
  event.preventDefault();
  const name = document.getElementById("buyer-name")?.value.trim() || "";
  const email = document.getElementById("buyer-email")?.value.trim() || "";
  const phone = document.getElementById("buyer-phone")?.value.trim() || "";
  const address = document.getElementById("buyer-address")?.value.trim() || "";
  const zip = document.getElementById("buyer-zip")?.value.trim() || "";


  // required fields
  if (!name || !email || !phone || !address) {
    alert("Please fill out all required fields.");
    return;
  }

  // normalize phone digits and validate length
  const digits = phone.replace(/\D/g, "");
  if (digits.length != 10) {
    alert("Phone number must contain exactly 10 digits.");
    return;
  }

  if (zip && zip.length > 6) {
    alert("ZIP code must be at most 6 characters.");
    return;
  }
// calculating totals
  const subtotal = cart.reduce((s, it) => s + it.price * it.qty, 0);
  const itemCount = cart.reduce((s, it) => s + it.qty, 0);
  const discount = itemCount >= 3 ? subtotal * 0.10 : 0;
  const afterDiscount = subtotal - discount;
  const tax = afterDiscount * 0.05;
  const total = afterDiscount + tax;

  // show checkout form
  document.getElementById("checkout-form")?.classList.add("d-none");
  document.getElementById("confirmation")?.classList.remove("d-none");


  // showing order summary 
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

// discount notification 
document.addEventListener("DOMContentLoaded", () => {
  console.log("script.js loaded");

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