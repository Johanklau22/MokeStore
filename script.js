const products = [
  { name: "Moke Manja", price: 50000, image: "Moke Manja.jpeg" },
  { name: "Hokka Wisk (Naga Batoto) B", price: 36000, image: "hoka wiski B.jpeg" },
  { name: "Hokka Wisk (Naga Batoto) K", price: 25000, image: "hoka wiski k.jpeg" },
  { name: "Moke Joss", price: 55000, image: "Moke Joss.jpeg" },
  { name: "Moke Merah", price: 52000, image: "moke merah.jpeg" },
  { name: "Moke Ganteng", price: 55000, image: "Moke Ganteng.jpeg" },
  { name: "Arak Bali", price: 40000, image: "Arak Bali.jpeg" },
];

const quantities = products.map(() => 0);
const rupiah = new Intl.NumberFormat("id-ID");

const productGrid = document.querySelector("#productGrid");
const orderList = document.querySelector("#orderList");
const receiptLines = document.querySelector("#receiptLines");
const paidItems = document.querySelector("#paidItems");
const freeItems = document.querySelector("#freeItems");
const grandTotal = document.querySelector("#grandTotal");
const paymentMethod = document.querySelector("#paymentMethod");
const paymentButtons = document.querySelector("#paymentButtons");
const paymentMessage = document.querySelector("#paymentMessage");
const paymentStatus = document.querySelector("#paymentStatus");
const payNowBtn = document.querySelector("#payNowBtn");
const receiptDate = document.querySelector("#receiptDate");
let isPaid = false;

function formatPrice(value) {
  return `Rp. ${rupiah.format(value)}`;
}

function renderProducts() {
  productGrid.innerHTML = products
    .map(
      (product) => `
        <article class="product-card">
          <div class="image-slot">
            <img src="${product.image}" alt="${product.name}" />
          </div>
          <div class="product-info">
            <h3>${product.name}</h3>
            <p class="price">${formatPrice(product.price)}</p>
          </div>
        </article>
      `
    )
    .join("");
}

function renderOrderControls() {
  orderList.innerHTML = products
    .map(
      (product, index) => `
        <div class="order-row">
          <div>
            <p>${product.name}</p>
            <span class="price">${formatPrice(product.price)}</span>
          </div>
          <div class="qty-control" aria-label="Jumlah ${product.name}">
            <button class="qty-button" type="button" data-action="minus" data-index="${index}">-</button>
            <span class="qty-value" id="qty-${index}">0</span>
            <button class="qty-button" type="button" data-action="plus" data-index="${index}">+</button>
          </div>
        </div>
      `
    )
    .join("");
}

function calculateOrder() {
  const totalPaidQty = quantities.reduce((sum, qty) => sum + qty, 0);
  const totalFreeQty = products.reduce((sum, _product, index) => {
    return sum + Math.floor(quantities[index] / 3);
  }, 0);
  const totalPrice = products.reduce((sum, product, index) => {
    return sum + product.price * quantities[index];
  }, 0);

  return { totalPaidQty, totalFreeQty, totalPrice };
}

function renderReceipt() {
  const selectedProducts = products
    .map((product, index) => ({ ...product, qty: quantities[index], free: Math.floor(quantities[index] / 3) }))
    .filter((product) => product.qty > 0);

  if (selectedProducts.length === 0) {
    receiptLines.innerHTML = '<p class="empty-note">Belum ada produk dipilih.</p>';
  } else {
    receiptLines.innerHTML = selectedProducts
      .map(
        (product) => `
          <div class="receipt-line">
            <span>${product.name}<br>${product.qty} bayar + ${product.free} gratis</span>
            <strong>${formatPrice(product.qty * product.price)}</strong>
          </div>
        `
      )
      .join("");
  }

  const order = calculateOrder();
  paymentStatus.textContent = isPaid ? `Lunas (${paymentMethod.value})` : "Belum dibayar";
  paidItems.textContent = `${order.totalPaidQty} botol`;
  freeItems.textContent = `${order.totalFreeQty} botol`;
  grandTotal.textContent = formatPrice(order.totalPrice);
}

function setPaymentMethod(method) {
  paymentMethod.value = method;
  document.querySelectorAll(".method-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.method === method);
  });
  if (isPaid) {
    paymentMessage.textContent = "";
    isPaid = false;
  }
  renderReceipt();
}

function payNow() {
  const order = calculateOrder();
  if (order.totalPaidQty === 0) {
    paymentMessage.textContent = "Pilih produk terlebih dahulu sebelum bayar.";
    return;
  }

  isPaid = true;
  paymentMessage.textContent = `Pembayaran berhasil menggunakan ${paymentMethod.value}.`;
  renderReceipt();
  document.querySelector("#receipt").scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateDate() {
  receiptDate.textContent = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function showProductsOnly() {
  document.body.classList.add("products-only");
  document.querySelector("#products").scrollIntoView({ behavior: "smooth" });
}

function showOrderSection() {
  document.body.classList.remove("products-only");
  document.querySelector("#checkout").scrollIntoView({ behavior: "smooth" });
}

function showHome() {
  document.body.classList.remove("products-only");
  document.querySelector("#home").scrollIntoView({ behavior: "smooth" });
}

orderList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const index = Number(button.dataset.index);
  const action = button.dataset.action;
  quantities[index] = Math.max(0, quantities[index] + (action === "plus" ? 1 : -1));
  document.querySelector(`#qty-${index}`).textContent = quantities[index];
  if (isPaid) {
    isPaid = false;
    paymentMessage.textContent = "";
  }
  renderReceipt();
});

paymentMethod.addEventListener("change", () => setPaymentMethod(paymentMethod.value));
paymentButtons.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-method]");
  if (!button) return;
  setPaymentMethod(button.dataset.method);
});
payNowBtn.addEventListener("click", payNow);

document.querySelector("#checkProductsBtn").addEventListener("click", showProductsOnly);
document.querySelector("#orderNowBtn").addEventListener("click", showOrderSection);
document.querySelector("#homeBtn").addEventListener("click", showHome);
document.querySelector("#printReceiptBtn").addEventListener("click", () => window.print());

document.querySelectorAll("[data-scroll-target]").forEach((button) => {
  button.addEventListener("click", () => {
    document.body.classList.remove("products-only");
    document.querySelector(`#${button.dataset.scrollTarget}`).scrollIntoView({ behavior: "smooth" });
  });
});

renderProducts();
renderOrderControls();
updateDate();
renderReceipt();
