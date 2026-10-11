const icons = document.querySelectorAll(".icon");
const searchLinks = document.querySelectorAll(".nav-link");
const productCards = document.querySelectorAll(".product-card");
const categoryCards = document.querySelectorAll(".category-card");
const viewLinks = document.querySelectorAll(".view-link");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cartCount = document.getElementById("cartCount");

  if (cartCount) {
    const totalItems = cart.reduce(function (total, item) {
      return total + Number(item.quantity || 0);
    }, 0);

    cartCount.textContent = totalItems;
  }
}

updateCartCount();

// Wishlist buttons
icons.forEach(function (button) {
  button.addEventListener("click", function (event) {
    event.stopPropagation();

    const heart = button.querySelector("i");

    if (!heart) {
      return;
    }

    if (heart.classList.contains("fa-regular")) {
      heart.classList.remove("fa-regular");
      heart.classList.add("fa-solid");
      button.classList.add("active");
    } else {
      heart.classList.remove("fa-solid");
      heart.classList.add("fa-regular");
      button.classList.remove("active");
    }
  });
});

// Product card click
productCards.forEach(function (card) {
  card.addEventListener("click", function (event) {
    if (
      event.target.closest(".icon") ||
      event.target.closest(".add-cart-btn")
    ) {
      return;
    }

    const nameElement = card.querySelector(".product-name");
    const priceElement = card.querySelector(".product-price");

    if (nameElement && priceElement) {
      const productName = nameElement.textContent.trim();
      const productPrice = priceElement.textContent.trim();

      alert(productName + " - " + productPrice);
    }
  });
});

// Add Add to Cart buttons
productCards.forEach(function (card) {
  const productDetails = card.querySelector(".product-details");

  if (!productDetails) {
    return;
  }

  if (productDetails.querySelector(".add-cart-btn")) {
    return;
  }

  const button = document.createElement("button");

  button.innerHTML = '<i class="fa-solid fa-cart-shopping"></i> ADD TO CART';

  button.className = "add-cart-btn";
  button.type = "button";

  productDetails.appendChild(button);

  button.addEventListener("click", function (event) {
    event.stopPropagation();

    const nameElement = card.querySelector(".product-name");
    const priceElement = card.querySelector(".product-price");
    const imageElement = card.querySelector(".product-image img");

    if (!nameElement || !priceElement) {
      return;
    }

    const productName = nameElement.textContent.trim();
    const productPrice = priceElement.textContent.trim();
    const productImage = imageElement ? imageElement.src : "";

    const existingProduct = cart.find(function (item) {
      return item.name === productName && item.price === productPrice;
    });

    if (existingProduct) {
      existingProduct.quantity++;
    } else {
      cart.push({
        name: productName,
        price: productPrice,
        image: productImage,
        quantity: 1,
      });
    }

    saveCart();

    button.innerHTML = '<i class="fa-solid fa-check"></i> ADDED';

    setTimeout(function () {
      button.innerHTML =
        '<i class="fa-solid fa-cart-shopping"></i> ADD TO CART';
    }, 1000);
  });
});

// Category cards
categoryCards.forEach(function (card) {
  card.addEventListener("click", function () {
    const categoryName = card.querySelector(".category-name");

    if (categoryName) {
      alert("You selected: " + categoryName.textContent.trim());
    }
  });
});

// Shop and explore buttons
const shopButtons = document.querySelectorAll(
  ".shop-btn, .explore-btn, .dark-btn",
);

shopButtons.forEach(function (button) {
  button.addEventListener("click", function (event) {
    const href = button.getAttribute("href");

    if (href && href.startsWith("#")) {
      const section = document.querySelector(href);

      if (section) {
        event.preventDefault();

        section.scrollIntoView({
          behavior: "smooth",
        });
      }
    }
  });
});

// Account navigation
const accountLink = Array.from(searchLinks).find(function (link) {
  return link.textContent.trim().toUpperCase().includes("ACCOUNT");
});

if (accountLink) {
  accountLink.setAttribute("href", "account.html");
}

// View All and Shop All links
viewLinks.forEach(function (link) {
  link.addEventListener("click", function (event) {
    const text = link.textContent.trim().toUpperCase();

    if (text.includes("VIEW ALL") || text.includes("SHOP ALL")) {
      const productsSection = document.querySelector("#products");

      if (productsSection) {
        event.preventDefault();

        productsSection.scrollIntoView({
          behavior: "smooth",
        });
      }
    }
  });
});

// Newsletter
const newsletterForm = document.getElementById("newsletterForm");

if (newsletterForm) {
  newsletterForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const emailInput = document.getElementById("newsletterEmail");
    const message = document.getElementById("newsletterMessage");

    if (emailInput && message) {
      message.textContent = "Thank you for subscribing!";
      newsletterForm.reset();
    }
  });
}
