// Global variables
let currentUser = null;
let cart = [];
let products = [];
let categories = [];

// Initialize application
$(document).ready(function () {
  checkSession();
  loadCategories();
  loadProducts();
  loadCart();
});

// Section navigation
function showSection(sectionId) {
  $("section").removeClass("active");
  $("#" + sectionId).addClass("active");
  $("nav a").removeClass("active");
  $("nav a").each(function () {
    if (
      $(this).text().toLowerCase().includes(sectionId) ||
      (sectionId === "home" && $(this).text() === "Home") ||
      (sectionId === "admin" && $(this).text() === "Admin Panel")
    ) {
      $(this).addClass("active");
    }
  });

  // Load section-specific content
  if (sectionId === "account" && currentUser) {
    loadAccountInfo();
  }
}

// Modal functions
function showModal(modalId) {
  $("#" + modalId).addClass("active");
}

function closeModal(modalId) {
  $("#" + modalId).removeClass("active");
  $("#" + modalId + " form")[0].reset();
  $("#" + modalId + "Message").html("");
}

// Check session
function checkSession() {
  $.ajax({
    url: "../server/checkSession.php",
    type: "GET",
    dataType: "json",
    success: function (response) {
      if (response.success && response.data) {
        currentUser = response.data;
        updateUIForLoggedInUser();
      }
    },
  });
}

// Login function
function login(event) {
  event.preventDefault();

  const username = $("#loginUsername").val();
  const password = $("#loginPassword").val();

  $.ajax({
    url: "../server/login.php",
    type: "POST",
    data: {
      username: username,
      password: password,
    },
    dataType: "json",
    success: function (response) {
      if (response.success) {
        currentUser = response.data;
        updateUIForLoggedInUser();
        closeModal("loginModal");
        showMessage("Login successful!", "success");
      } else {
        $("#loginMessage").html('<div class="alert alert-error">' + response.message + "</div>");
      }
    },
    error: function () {
      $("#loginMessage").html(
        '<div class="alert alert-error">An error occurred. Please try again.</div>'
      );
    },
  });
}

// Register function
function register(event) {
  event.preventDefault();

  const formData = {
    username: $("#regUsername").val(),
    email: $("#regEmail").val(),
    password: $("#regPassword").val(),
    firstName: $("#regFirstName").val(),
    lastName: $("#regLastName").val(),
    phone: $("#regPhone").val(),
  };

  $.ajax({
    url: "../server/register.php",
    type: "POST",
    data: formData,
    dataType: "json",
    success: function (response) {
      if (response.success) {
        closeModal("registerModal");
        showModal("loginModal");
        $("#loginMessage").html(
          '<div class="alert alert-success">Registration successful! Please login.</div>'
        );
      } else {
        $("#registerMessage").html('<div class="alert alert-error">' + response.message + "</div>");
      }
    },
    error: function () {
      $("#registerMessage").html(
        '<div class="alert alert-error">An error occurred. Please try again.</div>'
      );
    },
  });
}

// Logout function
function logout() {
  $.ajax({
    url: "../server/logout.php",
    type: "POST",
    dataType: "json",
    success: function (response) {
      currentUser = null;
      updateUIForLoggedOutUser();
      showSection("home");
      showMessage("Logged out successfully", "success");
    },
  });
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
  $("#userDisplay").text("Welcome, " + currentUser.firstName);
  $("#loginBtn, #registerBtn").hide();
  $("#logoutBtn").show();

  if (currentUser.userType === "staff") {
    $("#adminLink").show();
  }
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
  $("#userDisplay").text("Welcome, Guest");
  $("#loginBtn, #registerBtn").show();
  $("#logoutBtn, #adminLink").hide();
}

// Load categories
function loadCategories() {
  $.ajax({
    url: "../server/getCategories.php",
    type: "GET",
    dataType: "json",
    success: function (response) {
      if (response.success) {
        categories = response.data;
        populateCategoryFilter();
        displayFeaturedCategories();
      }
    },
  });
}

// Populate category filter
function populateCategoryFilter() {
  const select = $("#categoryFilter");
  select.html('<option value="">All Categories</option>');
  categories.forEach(function (category) {
    select.append(`<option value="${category.category_id}">${category.category_name}</option>`);
  });
}

// Display featured categories
function displayFeaturedCategories() {
  const container = $("#featuredCategories");
  container.empty();

  categories.slice(0, 6).forEach(function (category) {
    const card = `
                    <div class="product-card" onclick="showSection('products'); filterByCategory(${
                      category.category_id
                    })">
                        <div class="product-image">📦</div>
                        <div class="product-info">
                            <div class="product-name">${category.category_name}</div>
                            <p>${category.description || "Explore our eco-friendly products"}</p>
                        </div>
                    </div>
                `;
    container.append(card);
  });
}

// Load products
function loadProducts() {
  $("#productsLoading").addClass("active");

  $.ajax({
    url: "../server/getProducts.php",
    type: "GET",
    dataType: "json",
    success: function (response) {
      $("#productsLoading").removeClass("active");
      if (response.success) {
        products = response.data;
        displayProducts(products);
      }
    },
    error: function () {
      $("#productsLoading").removeClass("active");
      showMessage("Failed to load products", "error");
    },
  });
}

// Display products
function displayProducts(productsToShow) {
  const container = $("#productGrid");
  container.empty();

  if (productsToShow.length === 0) {
    container.html("<p>No products found.</p>");
    return;
  }

  productsToShow.forEach(function (product) {
    const ecoStars = "⭐".repeat(product.eco_rating || 5);
    const card = `
                    <div class="product-card">
                        <div class="product-image">🌿</div>
                        <div class="product-info">
                            <div class="product-name">${product.product_name}</div>
                            <div class="product-price">${parseFloat(product.price).toFixed(2)}</div>
                            <div class="eco-rating">Eco Rating: ${ecoStars}</div>
                            <div class="product-stock">Stock: ${product.stock_quantity}</div>
                            <button class="btn" onclick="addToCart(${
                              product.product_id
                            })">Add to Cart</button>
                        </div>
                    </div>
                `;
    container.append(card);
  });
}

// Search products
function searchProducts() {
  const searchTerm = $("#searchInput").val().toLowerCase();
  const filteredProducts = products.filter(function (product) {
    return (
      product.product_name.toLowerCase().includes(searchTerm) ||
      (product.description && product.description.toLowerCase().includes(searchTerm))
    );
  });
  displayProducts(filteredProducts);
}

// Filter by category
function filterByCategory(categoryId) {
  if (categoryId) {
    $("#categoryFilter").val(categoryId);
  }

  const selectedCategory = $("#categoryFilter").val();
  if (!selectedCategory) {
    displayProducts(products);
  } else {
    const filteredProducts = products.filter(function (product) {
      return product.category_id == selectedCategory;
    });
    displayProducts(filteredProducts);
  }
}

// Cart functions
function loadCart() {
  $.ajax({
    url: "../server/getCart.php",
    type: "GET",
    dataType: "json",
    success: function (response) {
      if (response.success) {
        cart = response.data || [];
        updateCartDisplay();
      }
    },
  });
}

function addToCart(productId) {
  $.ajax({
    url: "../server/addToCart.php",
    type: "POST",
    data: { productId: productId },
    dataType: "json",
    success: function (response) {
      if (response.success) {
        loadCart();
        showMessage("Product added to cart!", "success");
      } else {
        showMessage(response.message, "error");
      }
    },
  });
}

function updateCartDisplay() {
  const cartItems = $("#cartItems");
  const cartCount = $("#cartCount");
  const cartTotal = $("#cartTotal");

  cartItems.empty();
  let total = 0;
  let count = 0;

  if (cart.length === 0) {
    cartItems.html("<p>Your cart is empty.</p>");
  } else {
    cart.forEach(function (item) {
      const itemTotal = parseFloat(item.price) * parseInt(item.quantity);
      total += itemTotal;
      count += parseInt(item.quantity);

      const cartItem = `
                        <div class="cart-item">
                            <div>
                                <strong>${item.product_name}</strong><br>
                                ${parseFloat(item.price).toFixed(2)} x ${item.quantity}
                            </div>
                            <div>
                                <button class="btn btn-danger" onclick="removeFromCart(${
                                  item.product_id
                                })">Remove</button>
                            </div>
                        </div>
                    `;
      cartItems.append(cartItem);
    });
  }

  cartCount.text(count);
  cartTotal.text(`Total: ${total.toFixed(2)}`);
}

function removeFromCart(productId) {
  $.ajax({
    url: "../server/removeFromCart.php",
    type: "POST",
    data: { productId: productId },
    dataType: "json",
    success: function (response) {
      if (response.success) {
        loadCart();
        showMessage("Product removed from cart", "success");
      }
    },
  });
}

function clearCart() {
  if (!confirm("Are you sure you want to clear your cart?")) return;

  $.ajax({
    url: "../server/clearCart.php",
    type: "POST",
    dataType: "json",
    success: function (response) {
      if (response.success) {
        loadCart();
        showMessage("Cart cleared", "success");
      }
    },
  });
}

function checkout() {
  if (!currentUser) {
    showMessage("Please login to checkout", "error");
    showModal("loginModal");
    return;
  }

  if (cart.length === 0) {
    showMessage("Your cart is empty", "error");
    return;
  }

  $.ajax({
    url: "../server/checkout.php",
    type: "POST",
    dataType: "json",
    success: function (response) {
      if (response.success) {
        loadCart();
        showMessage("Order placed successfully! Order ID: " + response.data.orderId, "success");
        showSection("account");
      } else {
        showMessage(response.message, "error");
      }
    },
  });
}

// Account functions
function loadAccountInfo() {
  if (!currentUser) return;

  $.ajax({
    url: "../server/getAccountInfo.php",
    type: "GET",
    dataType: "json",
    success: function (response) {
      if (response.success) {
        displayAccountInfo(response.data);
      }
    },
  });
}

function displayAccountInfo(data) {
  const content = `
                <h3>Account Information</h3>
                <p><strong>Username:</strong> ${data.user.username}</p>
                <p><strong>Email:</strong> ${data.user.email}</p>
                <p><strong>Name:</strong> ${data.user.first_name} ${data.user.last_name}</p>
                <p><strong>Account Type:</strong> ${data.user.user_type}</p>
                
                <h3>Order History</h3>
                <div id="orderHistory"></div>
            `;
  $("#accountContent").html(content);

  if (data.orders && data.orders.length > 0) {
    let orderHtml = '<table style="width: 100%; border-collapse: collapse;">';
    orderHtml += "<tr><th>Order ID</th><th>Date</th><th>Total</th><th>Status</th></tr>";
    data.orders.forEach(function (order) {
      orderHtml += `
                        <tr>
                            <td>${order.order_id}</td>
                            <td>${new Date(order.order_date).toLocaleDateString()}</td>
                            <td>${parseFloat(order.total_amount).toFixed(2)}</td>
                            <td>${order.status}</td>
                        </tr>
                    `;
    });
    orderHtml += "</table>";
    $("#orderHistory").html(orderHtml);
  } else {
    $("#orderHistory").html("<p>No orders found.</p>");
  }
}

// Admin functions
function showAdminSection(section) {
  if (!currentUser || currentUser.userType !== "staff") {
    showMessage("Unauthorized access", "error");
    return;
  }

  const workArea = $("#adminWorkArea");

  switch (section) {
    case "products":
      loadAdminProducts();
      break;
    case "users":
      loadAdminUsers();
      break;
    case "orders":
      loadAdminOrders();
      break;
    case "add-product":
      showAddProductForm();
      break;
  }
}

function loadAdminProducts() {
  $.ajax({
    url: "../server/adminGetProducts.php",
    type: "GET",
    dataType: "json",
    success: function (response) {
      if (response.success) {
        displayAdminProducts(response.data);
      }
    },
  });
}

function displayAdminProducts(products) {
  let html = "<h3>Manage Products</h3>";
  html += '<table style="width: 100%; border-collapse: collapse;">';
  html += "<tr><th>ID</th><th>Name</th><th>Price</th><th>Stock</th><th>Actions</th></tr>";

  products.forEach(function (product) {
    html += `
                    <tr>
                        <td>${product.product_id}</td>
                        <td>${product.product_name}</td>
                        <td>${parseFloat(product.price).toFixed(2)}</td>
                        <td>${product.stock_quantity}</td>
                        <td>
                            <button class="btn btn-secondary" onclick="editProduct(${
                              product.product_id
                            })">Edit</button>
                            <button class="btn btn-danger" onclick="deleteProduct(${
                              product.product_id
                            })">Delete</button>
                        </td>
                    </tr>
                `;
  });

  html += "</table>";
  $("#adminWorkArea").html(html);
}

function showAddProductForm() {
  const html = `
                <h3>Add New Product</h3>
                <form id="addProductForm" onsubmit="addProduct(event)">
                    <div class="form-group">
                        <label>Product Name</label>
                        <input type="text" id="newProductName" required>
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <select id="newProductCategory" required></select>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="newProductDescription" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Price</label>
                        <input type="number" id="newProductPrice" step="0.01" min="0" required>
                    </div>
                    <div class="form-group">
                        <label>Stock Quantity</label>
                        <input type="number" id="newProductStock" min="0" required>
                    </div>
                    <div class="form-group">
                        <label>Eco Rating (1-5)</label>
                        <input type="number" id="newProductRating" min="1" max="5" value="5">
                    </div>
                    <button type="submit" class="btn">Add Product</button>
                </form>
            `;
  $("#adminWorkArea").html(html);

  // Populate categories
  categories.forEach(function (category) {
    $("#newProductCategory").append(
      `<option value="${category.category_id}">${category.category_name}</option>`
    );
  });
}

function addProduct(event) {
  event.preventDefault();

  const productData = {
    name: $("#newProductName").val(),
    category: $("#newProductCategory").val(),
    description: $("#newProductDescription").val(),
    price: $("#newProductPrice").val(),
    stock: $("#newProductStock").val(),
    rating: $("#newProductRating").val(),
  };

  $.ajax({
    url: "../server/adminAddProduct.php",
    type: "POST",
    data: productData,
    dataType: "json",
    success: function (response) {
      if (response.success) {
        showMessage("Product added successfully!", "success");
        loadProducts();
        loadAdminProducts();
      } else {
        showMessage(response.message, "error");
      }
    },
  });
}

function deleteProduct(productId) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  $.ajax({
    url: "../server/adminDeleteProduct.php",
    type: "POST",
    data: { productId: productId },
    dataType: "json",
    success: function (response) {
      if (response.success) {
        showMessage("Product deleted successfully", "success");
        loadProducts();
        loadAdminProducts();
      } else {
        showMessage(response.message, "error");
      }
    },
  });
}

// Utility functions
function showMessage(message, type) {
  const alertClass = type === "success" ? "alert-success" : "alert-error";
  const messageHtml = `<div class="alert ${alertClass}">${message}</div>`;

  // Add message to the top of the current section
  const currentSection = $("section.active");
  currentSection.prepend(messageHtml);

  // Auto-remove after 3 seconds
  setTimeout(function () {
    currentSection
      .find(".alert")
      .first()
      .fadeOut(function () {
        $(this).remove();
      });
  }, 3000);
}
