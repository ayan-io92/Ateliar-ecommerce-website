const icons = document.querySelectorAll(".icon");
const searchLinks = document.querySelectorAll(".nav-link");
const productCards = document.querySelectorAll(".product-card");
const categoryCards = document.querySelectorAll(".category-card");

// Shopping cart

let cart = [];

try {
  cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (!Array.isArray(cart)) {
    cart = [];
  }
} catch (error) {
  cart = [];
}

function saveCart() {
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
    return true;
  } catch (error) {
    alert("Unable to save your cart. Please try again.");
    return false;
  }
}

// Wishlist icons

icons.forEach(function (button) {
  button.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();

    const icon = button.querySelector("i");

    if (!icon) return;

    if (icon.classList.contains("fa-regular")) {
      icon.classList.remove("fa-regular");
      icon.classList.add("fa-solid");
      button.classList.add("active");
    } else {
      icon.classList.remove("fa-solid");
      icon.classList.add("fa-regular");
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

// Add to Cart buttons

productCards.forEach(function (card) {
  const productDetails = card.querySelector(".product-details");

  if (!productDetails) return;

  let button = productDetails.querySelector(".add-cart-btn");

  if (!button) {
    button = document.createElement("button");
    button.type = "button";
    button.className = "add-cart-btn";
    productDetails.appendChild(button);
  }

  button.innerHTML = '<i class="fa-solid fa-cart-shopping"></i> ADD TO CART';

  button.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();

    const nameElement = card.querySelector(".product-name");
    const priceElement = card.querySelector(".product-price");
    const imageElement = card.querySelector(".product-image img");

    if (!nameElement || !priceElement) return;

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

    if (!saveCart()) {
      return;
    }

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

// Shop and Explore buttons

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

// Account link - open account.html

const accountLink = Array.from(searchLinks).find(function (link) {
  return link.textContent.trim().toUpperCase().includes("ACCOUNT");
});

if (accountLink) {
  accountLink.setAttribute("href", "account.html");

  accountLink.addEventListener("click", function (event) {
    event.preventDefault();
    window.location.href = "account.html";
  });
}

// View All and Shop All links

const viewLinks = document.querySelectorAll(".view-link");

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
