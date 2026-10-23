"use strict";

// HTML elements
const productsContainer = document.getElementById("products-container");

const searchToggle = document.getElementById("searchToggle");
const searchModal = document.getElementById("searchModal");
const searchInput = document.getElementById("siteSearchInput");
const searchResults = document.getElementById("searchResults");
const searchForm = document.getElementById("searchForm");
const closeSearch = document.getElementById("closeSearch");

const cartLink = document.getElementById("cartLink");
const cartCount = document.getElementById("cartCount");
const cartOverlay = document.getElementById("cartOverlay");
const cartDrawer = document.getElementById("cartDrawer");
const closeCartDrawer = document.getElementById("closeCartDrawer");
const cartDrawerItems = document.getElementById("cartDrawerItems");
const drawerItemCount = document.getElementById("drawerItemCount");
const drawerSubtotal = document.getElementById("drawerSubtotal");
const drawerCheckoutButton = document.getElementById("drawerCheckoutButton");

const newsletterForm = document.getElementById("newsletterForm");
const newsletterMessage = document.getElementById("newsletterMessage");

const CART_KEY = "cart";

let allProducts = [];
let cart = loadCart();

// Load saved cart
function loadCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem(CART_KEY));

    if (!Array.isArray(savedCart)) {
      return [];
    }

    return savedCart
      .filter(function (item) {
        return item && item.id !== undefined;
      })
      .map(function (item) {
        return {
          id: String(item.id),
          name: item.name || item.title || "Product",
          title: item.title || item.name || "Product",
          price: Number(item.price) || 0,
          image: item.image || "",
          category: item.category || "",
          quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
        };
      });
  } catch (error) {
    return [];
  }
}

// Save cart
function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    return true;
  } catch (error) {
    console.log("Unable to save cart.");
    return false;
  }
}

// Format price
function formatPrice(price) {
  return "$" + Number(price).toFixed(2);
}

// Get total quantity
function getCartQuantity() {
  let total = 0;

  for (let i = 0; i < cart.length; i++) {
    total += cart[i].quantity;
  }

  return total;
}

// Get subtotal
function getCartSubtotal() {
  let total = 0;

  for (let i = 0; i < cart.length; i++) {
    total += cart[i].price * cart[i].quantity;
  }

  return total;
}

// Update cart number
function updateCartCount() {
  if (cartCount) {
    cartCount.textContent = getCartQuantity();
  }
}

// Add product to cart
function addToCart(product) {
  const productId = String(product.id);
  const productPrice = Number(product.price);

  if (!productId || !Number.isFinite(productPrice)) {
    return false;
  }

  const existingItem = cart.find(function (item) {
    return String(item.id) === productId;
  });

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({
      id: productId,
      name: product.title || product.name || "Product",
      title: product.title || product.name || "Product",
      price: productPrice,
      image: product.image || "",
      category: product.category || "",
      quantity: 1,
    });
  }

  if (!saveCart()) {
    cart = loadCart();
    return false;
  }

  updateCartCount();
  renderCartDrawer();

  return true;
}

// Open cart drawer
function openCartDrawer() {
  if (!cartDrawer || !cartOverlay) {
    return;
  }

  hideSearch();
  renderCartDrawer();

  cartDrawer.classList.add("active");
  cartOverlay.classList.add("active");
  document.body.classList.add("cart-open");

  cartDrawer.setAttribute("aria-hidden", "false");

  if (cartLink) {
    cartLink.setAttribute("aria-expanded", "true");
  }
}

// Close cart drawer
function hideCartDrawer() {
  if (!cartDrawer || !cartOverlay) {
    return;
  }

  cartDrawer.classList.remove("active");
  cartOverlay.classList.remove("active");
  document.body.classList.remove("cart-open");

  cartDrawer.setAttribute("aria-hidden", "true");

  if (cartLink) {
    cartLink.setAttribute("aria-expanded", "false");
  }
}

// Cart link
if (cartLink) {
  cartLink.addEventListener("click", function (event) {
    event.preventDefault();
    openCartDrawer();
  });
}

// Close cart button
if (closeCartDrawer) {
  closeCartDrawer.addEventListener("click", hideCartDrawer);
}

// Close cart by clicking overlay
if (cartOverlay) {
  cartOverlay.addEventListener("click", hideCartDrawer);
}

// Close panels with Escape
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    hideCartDrawer();
    hideSearch();
  }
});

// Display cart items
function renderCartDrawer() {
  if (!cartDrawerItems) {
    return;
  }

  cartDrawerItems.innerHTML = "";

  const quantity = getCartQuantity();
  const subtotal = getCartSubtotal();

  if (drawerItemCount) {
    drawerItemCount.textContent = "(" + quantity + ")";
  }

  if (drawerSubtotal) {
    drawerSubtotal.textContent = formatPrice(subtotal);
  }

  if (drawerCheckoutButton) {
    drawerCheckoutButton.classList.toggle("disabled", cart.length === 0);
    drawerCheckoutButton.setAttribute(
      "aria-disabled",
      cart.length === 0 ? "true" : "false",
    );
  }

  if (cart.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "cart-empty";
    emptyMessage.textContent = "Your cart is empty. Find something you love.";
    cartDrawerItems.appendChild(emptyMessage);
    return;
  }

  cart.forEach(function (item) {
    const row = document.createElement("div");
    row.className = "cart-drawer-item";

    const image = document.createElement("img");
    image.src = item.image;
    image.alt = item.name;
    image.loading = "lazy";

    const info = document.createElement("div");
    info.className = "cart-drawer-product-info";

    const name = document.createElement("h3");
    name.className = "cart-drawer-product-name";
    name.textContent = item.name;

    const price = document.createElement("p");
    price.className = "cart-drawer-product-price";
    price.textContent = formatPrice(item.price);

    const actions = document.createElement("div");
    actions.className = "cart-drawer-item-actions";

    const quantityBox = document.createElement("div");
    quantityBox.className = "cart-quantity";

    const minusButton = document.createElement("button");
    minusButton.type = "button";
    minusButton.textContent = "−";
    minusButton.setAttribute("aria-label", "Decrease quantity");

    const quantityNumber = document.createElement("span");
    quantityNumber.textContent = item.quantity;

    const plusButton = document.createElement("button");
    plusButton.type = "button";
    plusButton.textContent = "+";
    plusButton.setAttribute("aria-label", "Increase quantity");

    minusButton.addEventListener("click", function () {
      changeQuantity(item.id, -1);
    });

    plusButton.addEventListener("click", function () {
      changeQuantity(item.id, 1);
    });

    quantityBox.appendChild(minusButton);
    quantityBox.appendChild(quantityNumber);
    quantityBox.appendChild(plusButton);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "cart-remove";
    removeButton.textContent = "Remove";

    removeButton.addEventListener("click", function () {
      removeFromCart(item.id);
    });

    actions.appendChild(quantityBox);
    actions.appendChild(removeButton);

    info.appendChild(name);
    info.appendChild(price);
    info.appendChild(actions);

    row.appendChild(image);
    row.appendChild(info);

    cartDrawerItems.appendChild(row);
  });
}

// Change cart quantity
function changeQuantity(productId, amount) {
  const item = cart.find(function (product) {
    return String(product.id) === String(productId);
  });

  if (!item) {
    return;
  }

  item.quantity += amount;

  if (item.quantity <= 0) {
    cart = cart.filter(function (product) {
      return String(product.id) !== String(productId);
    });
  }

  if (saveCart()) {
    updateCartCount();
    renderCartDrawer();
  } else {
    cart = loadCart();
    updateCartCount();
    renderCartDrawer();
  }
}

// Remove product from cart
function removeFromCart(productId) {
  const previousCart = cart.slice();

  cart = cart.filter(function (item) {
    return String(item.id) !== String(productId);
  });

  if (saveCart()) {
    updateCartCount();
    renderCartDrawer();
  } else {
    cart = previousCart;
  }
}

// Create product card
function createProductCard(product) {
  const column = document.createElement("div");
  column.className = "col-lg-3 col-md-6 col-sm-6";

  const card = document.createElement("article");
  card.className = "product-card";
  card.dataset.productId = product.id;

  const imageWrap = document.createElement("div");
  imageWrap.className = "product-image";

  const image = document.createElement("img");
  image.src = product.image;
  image.alt = product.title;
  image.loading = "lazy";

  const label = document.createElement("span");
  label.className = "new-label";
  label.textContent = "NEW";

  const heart = document.createElement("button");
  heart.type = "button";
  heart.className = "icon";
  heart.setAttribute("aria-label", "Add to favorites");
  heart.setAttribute("aria-pressed", "false");
  heart.innerHTML = '<i class="fa-regular fa-heart"></i>';

  const quickAdd = document.createElement("button");
  quickAdd.type = "button";
  quickAdd.className = "quick-add-btn";
  quickAdd.dataset.action = "add";
  quickAdd.innerHTML = '<i class="fa-solid fa-plus"></i> QUICK ADD';

  imageWrap.appendChild(image);
  imageWrap.appendChild(label);
  imageWrap.appendChild(heart);
  imageWrap.appendChild(quickAdd);

  const details = document.createElement("div");
  details.className = "product-details";

  const category = document.createElement("p");
  category.className = "product-category";
  category.textContent = product.category;

  const title = document.createElement("h3");
  title.className = "product-name";
  title.textContent = product.title;

  const price = document.createElement("p");
  price.className = "product-price";
  price.textContent = formatPrice(product.price);

  details.appendChild(category);
  details.appendChild(title);
  details.appendChild(price);

  card.appendChild(imageWrap);
  card.appendChild(details);
  column.appendChild(card);

  return column;
}

// Load all products from Fake Store API
async function getProducts() {
  if (!productsContainer) {
    return;
  }

  productsContainer.innerHTML =
    '<div class="col-12 text-center py-5">Loading products...</div>';

  try {
    const response = await fetch("https://fakestoreapi.com/products");

    if (!response.ok) {
      throw new Error("Products could not load.");
    }

    allProducts = await response.json();
    productsContainer.innerHTML = "";

    // Show only 8 products on the home page.
    // Search below still uses every product in allProducts.
    allProducts.slice(0, 8).forEach(function (product) {
      productsContainer.appendChild(createProductCard(product));
    });

    if (searchInput && searchInput.value.trim() !== "") {
      performSearch(searchInput.value);
    }
  } catch (error) {
    productsContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <p>Unable to load products. Please check your internet connection.</p>
                <button class="btn btn-dark" id="retryProducts">Try Again</button>
            </div>
        `;
  }
}

// Product card buttons
if (productsContainer) {
  productsContainer.addEventListener("click", function (event) {
    if (event.target.closest("#retryProducts")) {
      getProducts();
      return;
    }

    const card = event.target.closest(".product-card");

    if (!card) {
      return;
    }

    const product = allProducts.find(function (item) {
      return String(item.id) === String(card.dataset.productId);
    });

    if (!product) {
      return;
    }

    const heart = event.target.closest(".icon");

    if (heart) {
      const icon = heart.querySelector("i");
      const isActive = heart.classList.toggle("active");

      icon.classList.toggle("fa-solid", isActive);
      icon.classList.toggle("fa-regular", !isActive);

      heart.setAttribute("aria-pressed", String(isActive));
      heart.setAttribute(
        "aria-label",
        isActive ? "Remove from favorites" : "Add to favorites",
      );

      return;
    }

    const addButton = event.target.closest('[data-action="add"]');

    if (addButton && addToCart(product)) {
      addButton.innerHTML = '<i class="fa-solid fa-check"></i> ADDED';
      addButton.disabled = true;

      setTimeout(function () {
        addButton.innerHTML = '<i class="fa-solid fa-plus"></i> QUICK ADD';
        addButton.disabled = false;
      }, 1500);
    }
  });
}

// Open search panel
function openSearch() {
  if (!searchModal || !searchToggle) {
    return;
  }

  searchModal.hidden = false;
  searchToggle.setAttribute("aria-expanded", "true");

  if (searchInput) {
    searchInput.focus();
  }
}

// Close search panel
function hideSearch() {
  if (!searchModal || !searchToggle) {
    return;
  }

  searchModal.hidden = true;
  searchToggle.setAttribute("aria-expanded", "false");
}

// Prepare text for searching
function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .trim();
}

// Search products and page sections
function performSearch(searchText) {
  if (!searchResults) {
    return;
  }

  searchResults.innerHTML = "";

  const query = normalize(searchText);

  if (!query) {
    searchResults.textContent = "Search for something you love.";
    return;
  }

  let resultCount = 0;

  // Search every product from the API, not just the 8 visible products.
  allProducts.forEach(function (product) {
    const productText = [
      product.title,
      product.category,
      product.description,
      product.price,
    ].join(" ");

    if (!normalize(productText).includes(query)) {
      return;
    }

    const row = document.createElement("div");
    row.className = "search-result-item";

    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.title;

    const info = document.createElement("div");
    info.className = "search-result-info";

    const title = document.createElement("strong");
    title.textContent = product.title;

    const detail = document.createElement("small");
    detail.textContent = product.category + " · " + formatPrice(product.price);

    info.appendChild(title);
    info.appendChild(detail);

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "search-result-add";
    addButton.textContent = "ADD";

    // Add to cart without opening the cart drawer.
    // Change the button back to ADD after 1500 milliseconds.
    addButton.addEventListener("click", function () {
      if (addButton.disabled) {
        return;
      }

      if (addToCart(product)) {
        addButton.textContent = "ADDED";
        addButton.disabled = true;

        setTimeout(function () {
          addButton.textContent = "ADD";
          addButton.disabled = false;
        }, 1500);
      }
    });

    row.appendChild(image);
    row.appendChild(info);
    row.appendChild(addButton);

    searchResults.appendChild(row);
    resultCount++;
  });

  // Search other page sections as well.
  document.querySelectorAll("section, footer").forEach(function (section) {
    if (
      section.id === "products" ||
      section.contains(searchModal) ||
      !normalize(section.innerText).includes(query)
    ) {
      return;
    }

    const heading = section.querySelector("h1, h2, h3");
    const link = document.createElement("a");

    link.className = "search-page-result";
    link.href = section.id ? "#" + section.id : "#home";

    const title = document.createElement("strong");
    title.textContent = heading ? heading.textContent.trim() : "Homepage";

    const description = document.createElement("small");
    description.textContent = section.innerText
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 110);

    link.appendChild(title);
    link.appendChild(description);
    link.addEventListener("click", hideSearch);

    searchResults.appendChild(link);
    resultCount++;
  });

  if (resultCount === 0) {
    const message = document.createElement("p");
    message.textContent = 'No results found for "' + searchText + '".';
    searchResults.appendChild(message);
  }
}

// Search toggle button
if (searchToggle) {
  searchToggle.addEventListener("click", function (event) {
    event.preventDefault();

    if (searchModal.hidden) {
      openSearch();
    } else {
      hideSearch();
    }
  });
}

// Close search button
if (closeSearch) {
  closeSearch.addEventListener("click", hideSearch);
}

// Search form
if (searchForm) {
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (searchInput) {
      performSearch(searchInput.value);
    }
  });
}

// Search while typing
if (searchInput) {
  searchInput.addEventListener("input", function () {
    performSearch(searchInput.value);
  });
}

// Close search when clicking outside it
document.addEventListener("click", function (event) {
  if (
    searchModal &&
    !searchModal.hidden &&
    !event.target.closest(".search-nav-item")
  ) {
    hideSearch();
  }
});

// Category cards open search
document.querySelectorAll(".category-card").forEach(function (card) {
  card.addEventListener("click", function (event) {
    event.preventDefault();

    const category = this.dataset.category || "";

    if (searchInput) {
      searchInput.value = category;
    }

    openSearch();
    performSearch(category);
  });
});

// Newsletter form
if (newsletterForm) {
  newsletterForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("newsletterEmail");

    if (!email || !email.checkValidity()) {
      if (email) {
        email.reportValidity();
      }

      return;
    }

    if (newsletterMessage) {
      newsletterMessage.textContent = "Thank you for subscribing!";
    }

    newsletterForm.reset();
  });
}

// Start the page
updateCartCount();
renderCartDrawer();
getProducts();
const reviewsContainer = document.getElementById("reviewsContainer");
const slideNumber = document.getElementById("slideNumber");

const reviews = [
  {
    id: 1,
    name: "Emma M.",
    picture: "https://i.pravatar.cc/100?img=47",
    rating: 5,
    review:
      "Beautifully made and even better in person. The quality and attention to detail are exceptional.",
  },
  {
    id: 2,
    name: "James A.",
    picture: "https://i.pravatar.cc/100?img=12",
    rating: 5,
    review:
      "The perfect addition to our living room. Minimal, comfortable and exactly what we were looking for.",
  },
  {
    id: 3,
    name: "Sofia O.",
    picture: "https://i.pravatar.cc/100?img=44",
    rating: 5,
    review:
      "I love the whole Atelier aesthetic. Everything feels thoughtfully designed and incredibly well made.",
  },
  {
    id: 4,
    name: "Oliver K.",
    picture: "https://i.pravatar.cc/100?img=13",
    rating: 4,
    review:
      "Beautiful design and excellent quality. The furniture looks wonderful in our home.",
  },
  {
    id: 5,
    name: "Isabella R.",
    picture: "https://i.pravatar.cc/100?img=49",
    rating: 5,
    review:
      "A lovely shopping experience. The details, materials and finish are even better than expected.",
  },
  {
    id: 6,
    name: "Zara A.",
    picture: "https://i.pravatar.cc/150?img=9",
    rating: 5,
    review:
      "The perfect addition to our living room. Minimal, comfortable and exactly what we were looking for.",
  },
];

function createReviewCard(review) {
  let stars = "";

  for (let i = 1; i <= 5; i++) {
    if (i <= review.rating) {
      stars += "★";
    } else {
      stars += "☆";
    }
  }

  return `
        <div class="review-card" id="review-${review.id}">
            <div class="review-stars" aria-label="${review.rating} out of 5 stars">
                ${stars}
            </div>

            <p class="review-text">
                “${review.review}”
            </p>

            <div class="customer-info">
                <img
                    src="${review.picture}"
                    alt="${review.name}"
                    class="customer-picture"
                    loading="lazy"
                >

                <div>
                    <p class="customer-name">${review.name}</p>
                    <p class="customer-status">Verified customer</p>
                </div>
            </div>
        </div>
    `;
}

function displayReviews() {
  let reviewSlides = "";

  for (let i = 0; i < reviews.length; i += 3) {
    reviewSlides += `
            <div class="carousel-item ${i === 0 ? "active" : ""}">
                <div class="row g-4">
        `;

    for (let j = i; j < i + 3 && j < reviews.length; j++) {
      reviewSlides += `
                <div class="col-12 col-md-6 col-lg-4">
                    ${createReviewCard(reviews[j])}
                </div>
            `;
    }

    reviewSlides += `
                </div>
            </div>
        `;
  }

  reviewsContainer.innerHTML = reviewSlides;

  updateSlideNumber();
}

function updateSlideNumber() {
  const activeSlide = reviewsContainer.querySelector(".carousel-item.active");
  const slides = reviewsContainer.querySelectorAll(".carousel-item");

  if (activeSlide) {
    const slideIndex = Array.from(slides).indexOf(activeSlide) + 1;

    slideNumber.textContent =
      String(slideIndex).padStart(2, "0") +
      " / " +
      String(slides.length).padStart(2, "0");
  }
}

displayReviews();

document
  .getElementById("reviewsCarousel")
  .addEventListener("slid.bs.carousel", function () {
    updateSlideNumber();
  });
