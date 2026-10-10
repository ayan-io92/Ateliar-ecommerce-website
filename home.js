const icons = document.querySelectorAll(".icon");
const searchLinks = document.querySelectorAll(".nav-link");

const productCards = document.querySelectorAll(".product-card");

icons.forEach(function (icon) {
  icon.addEventListener("click", function (event) {
    event.stopPropagation();

    const icon = icon.querySelector("i");

    if (icon.classList.contains("fa-regular")) {
      icon.classList.remove("fa-regular");
      icon.classList.add("fa-solid");
      icon.classList.add("active");
    } else {
      icon.classList.remove("fa-solid");
      icon.classList.add("fa-regular");
      icon.classList.remove("active");
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

  // Avoid adding the button twice
  if (productDetails.querySelector(".add-cart-btn")) {
    return;
  }

  const button = document.createElement("button");

  button.innerHTML = '<i class="fa-solid fa-cart-shopping"></i> ADD TO CART';
  button.className = "add-cart-btn";

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
const categoryCards = document.querySelectorAll(".category-card");

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
