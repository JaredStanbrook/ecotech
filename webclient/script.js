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

/**
 * Updates the specified section as the active section.
 * 
 * @param {string} sectionId HTML section ID to add to current active page. 
 *  One of: "cart", "home", "products", "account", "admin", "help"
 */
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

/**
 * Adds the "active" class to the specified modal.
 * 
 * @param {string} modalId HTML modal ID. One of: "loginModal", "registerModal"
 */
function showModal(modalId) {
  $("#" + modalId).addClass("active"); 
}

/**
 * Removes the "active" class to the specified modal.
 * 
 * @param {string} modalId HTML modal ID. One of: "loginModal", "registerModal"
 */
function closeModal(modalId) {
  $("#" + modalId).removeClass("active");
  $("#" + modalId + " form")[0].reset();
  $("#" + modalId + "Message").html("");
}

/**
 * Checks the current session and updates UI.
 * 
 * @description
 * Sends a GET request to the server-side script: "checkSession.php"
 * to verify whether a user session exists and returns the current session 
 * state. Expects a JSON response with properties: 
 * "{ success: boolean, data: object }".
 * @see ../server/login.php
 */
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

/**
 * Attempts a login based on the current contents of the login form.
 * input elements.
 * 
 * @param {SubmitEvent} event The form submission event object.
 * @description
 * Attempts a login based on the current contents of the username and password
 * inputs of the login form. Sends a POST request (data from the login form 
 * element) to the server-side script: "login.php". Expects a JSON response with 
 * properties: "{ success: boolean, message: string, data: object }".
 * @see ../server/login.php
 */
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
        showMessage(response.message, "success");
      } else {
        $("#loginMessage").html(
          '<div class="alert alert-error">' + response.message + "</div>"
        );
      }
    },
    error: function () {
      $("#loginMessage").html(
        '<div class="alert alert-error">An error occurred. Please try again.</div>'
      );
    },
  });
}


/**
 * Registers a new user based on the conents of the register form element.
 * 
 * @param {SubmitEvent} event The form submission event object.
 * @description
 * Attempts to register a new user based on the current contents of the input 
 * elements of the register form element. Sends a POST request 
 * (data from registerForm element) to the server-side script: "register.php". 
 * Expects a JSON response with properties: 
 * "{ success: boolean, message: string }".
 * @see ../server/register.php
 */
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
          `<div class="alert alert-success">${response.message}</div>`
        );
      } else {
        $("#registerMessage").html(
          `<div class="alert alert-error">${response.message}</div>`
        );
      }
    },
    error: function () {
      $("#registerMessage").html(
        `<div class="alert alert-error">${response.message}</div>`
      );
    },
  });
}


/**
 * Logs the current user out.
 * 
 * @description
 * Sends a POST request (data from session state) to the server-side script: 
 * "logout.php". Expects a JSON response with properties: 
 * "{ success: boolean, message: string }".
 * @see ../server/logout.php
 */
function logout() {
  $.ajax({
    url: "../server/logout.php",
    type: "POST",
    dataType: "json",
    success: function (response) {
      currentUser = null;
      updateUIForLoggedOutUser();
      showSection("home");
      showMessage(response.message, "success");
    },
  });
}

/**
 * Update UI for logged in user.
 */
function updateUIForLoggedInUser() {
  $("#userDisplay").text("Welcome, " + currentUser.firstName);
  $("#loginBtn, #registerBtn").hide();
  $("#logoutBtn").show();

  if (currentUser.userType === "staff") {
    $("#adminLink").show();
  }
}

/**
 * Update UI for logged out user.
 */
function updateUIForLoggedOutUser() {
  $("#userDisplay").text("Welcome, Guest");
  $("#loginBtn, #registerBtn").show();
  $("#logoutBtn, #adminLink").hide();
}

/**
 * Loads categories into the global array variable "categories".
 * 
 * @description
 * Sends a GET request to the server-side script: "getCategories.php" to 
 * retrieve category values from the database. Expects a JSON response with 
 * properties: { success: boolean, message: string, data: array}.
 * @see ../server/getCategories.php
 */
function loadCategories() {
  $.ajax({
    url: "../server/getCategories.php",
    type: "GET",
    dataType: "json",
    success: function (response) {
      if (response.success) {
        categories = response.data;
        populateCategoryFilter("categoryFilter");
        displayFeaturedCategories();
      }
    },
  });
}

/**
 * Populate category filter.
 * 
 * @description 
 * Fills the select element with ID: "categoryFilter" with values based on the
 * values of the "categories" global array. 
 */
function populateCategoryFilter(id) {
  const select = $(`#${id}`);
  select.html('<option value="">All Categories</option>');
  categories.forEach(function (category) {
    select.append(
      `<option value="${category.category_id}">${category.category_name}</option>`
    );
  });
}

/**
 * Display featured categories.
 */
function displayFeaturedCategories() {
  const displayLimit = 6;
  const container = $("#featuredCategories");
  container.empty();

  categories.slice(0, displayLimit).forEach(function (category) {
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


/**
 * Loads products into the global array variable "products".
 * 
 * @description
 * Sends a GET request to the server-side script: "getProducts.php" to retrieve
 * products from the database. Expects a JSON response with properties: 
 * "{ success: boolean, message; string, data: array }".
 * @see ../server/getProducts.php
 */
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
      showMessage(response.message, "error");
    },
  });
}

/**
 * Display the specified products on the UI.
 * 
 * @param {array} productsToShow Array of product objects to display.
 */
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
                  </div>
                  <button class="btn" onclick="addToCart(${
                        product.product_id
                    })">Add to Cart</button>
              </div>
          `;
    container.append(card);
  });
}

/**
 * Search products based on the current content of the input element with ID: 
 * "searchInput".
 */
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

/**
 * Filters products based on a category.
 * 
 * @param {string} categoryId Product category to filter by
 */
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

/**
 * Load cart data into the global array variable "cart" based on server-side 
 * user cart data.
 * 
 * @description
 * Sends a GET request to the server-side script: "getCart.php" to retrieve the 
 * user's cart state from the database.
 * Expects a JSON response with properties: { success: boolean, data: array }.
 * @see ../server/getCart.php
 */
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

/**
 * Adds product to cart.
 * 
 * @param {number} productId Product ID as an integer to add to cart.
 * @description
 * Adds a product to cart via a POST request (productID) to the server-side 
 * script: "addToCart.php". Expects a JSON response with properties: 
 * "{ success: boolean, message: string }."
 * @see ../server/addToCart.php
 */
function addToCart(productId) {
  $.ajax({
    url: "../server/addToCart.php",
    type: "POST",
    data: { productId: productId },
    dataType: "json",
    success: function (response) {
      if (response.success) {
        loadCart();
        showMessage(response.message, "success");
      } else {
        showMessage(response.message, "error");
      }
    },
  });
}

/**
 * Updates the cart display based on the current state of the global variable 
 * "cart".
 */
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

/**
 * Removes a product from a user's cart.
 * 
 * @param {number} productId Product ID as an integer to remove from cart. 
 * @description 
 * Sends a POST request (productId) to the server-side script: "removeFromCart".
 * Expects a JSON response with properties: 
 * "{ success: boolean, message: string }".
 * @see ../server/removeFromCart.php
 */
function removeFromCart(productId) {
  $.ajax({
    url: "../server/removeFromCart.php",
    type: "POST",
    data: { productId: productId },
    dataType: "json",
    success: function (response) {
      if (response.success) {
        loadCart();
        showMessage(response.message, "success");
      }
    },
  });
}

/**
 * Clears the state of the global variable "cart".
 * 
 * @description
 * Sends a POST request (data from session state) to the server-side script: 
 * "clearCart.php". Expects a JSON response with properties: 
 * "{ success: boolean, message: string }".
 * @see ../server/clearCart.php
 */
function clearCart() {
  if (!confirm("Are you sure you want to clear your cart?")) return;

  $.ajax({
    url: "../server/clearCart.php",
    type: "POST",
    dataType: "json",
    success: function (response) {
      if (response.success) {
        loadCart();
        showMessage(response.message, "success");
      }
    },
  });
}

/**
 * Checkout function for the current registered user.
 * 
 * @description
 * Sends a POST request (data from session state) to the server-side script: 
 * "checkout.php". Expects a JSON response with properties: 
 * "{ success: boolean, data: object, message: string }".
 * @see ../server/checkout.php
 */
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
        showMessage(
          `${response.message} Order ID: ${response.data.orderId}`, "success"
        );
        showSection("account");
      } else {
        showMessage(response.message, "error");
      }
    },
  });
}

// Account functions


/**
 * Loads the current user's account info based on the state of the global 
 * variable "currentUser".
 * 
 * @description
 * Sends a GET request to the server-side script: "getAccountInfo.php" to 
 * retrieve user data and order history from the database.
 * Expects a JSON response with properties: 
 * "{ success: boolean, data: object }".
 * @see ../server/getAccountInfo.php
 */
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

/**
 * Displays account info: username, email, name, account type, order history.
 * @param {object} data Account info retrieved from server
 * @see ../server/getAccountInfo.php
 */
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

/**
 * Displays the specified admin section and relevant data.
 * @param {string} section Admin section and data to display.
 */
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

/**
 * Loads product data into the global array variable "products" for an admin 
 * level account.
 * 
 * @description
 * Sends a GET request to the server-side script: "adminGetProducts.php" to 
 * retrieve all products from the database.
 * Expects a JSON response with properties: "{ success: boolean, data: object }".
 * @see ../server/adminGetProducts.php
 */
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

/**
 * Displays all products based on the state of the "products" global variable.
 * @param {array} products Array of products to display
 */
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
                      <button class="btn btn-secondary" onclick="showEditProductForm(${product.product_id})">Edit</button>
                      <button class="btn btn-danger" onclick="deleteProduct(${product.product_id})">Delete</button>
                  </td>
              </tr>
          `;
  });

  html += "</table>";
  $("#adminWorkArea").html(html);
}

/** 
 * Displays an add product form element with ID: "addProductForm" to the admin 
 * work area element
 */
function showAddProductForm() {
  const categoryFilterId = "newProductCategory";
  const html = `
          <h3>Add New Product</h3>
          <form id="addProductForm" onsubmit="addProduct(event)">
              <div class="form-group">
                  <label>Product Name</label>
                  <input type="text" id="newProductName" required>
              </div>
              <div class="form-group">
                  <label>Category</label>
                  <select id="${categoryFilterId}" required></select>
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
  populateCategoryFilter(categoryFilterId);
}

/** 
 * Displays an add product form element with ID: "editProductForm" to the admin
 * work area element
 */
function showEditProductForm(product_id) {
  if (!product_id) {
    showMessage("Missing product to edit.", "error");
    return;
  }
  const product = products.find((p) => Number(p.product_id) === Number(product_id));

  if (!product) {
    showMessage("Product not found.", "error");
    return;
  }
  const categoryFilterId = "editProductCategory";
  const html = `
    <h3>Edit Product</h3>
    <form id="editProductForm" onsubmit="updateProduct(event)">
        <input type="hidden" id="editProductId" value="${product.product_id}">
        <div class="form-group">
            <label>Product Name</label>
            <input type="text" id="editProductName" value="${product.product_name}" required>
        </div>
        <div class="form-group">
            <label>Category</label>
            <select id="${categoryFilterId}" required></select>
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea id="editProductDescription" rows="3">${product.description}</textarea>
        </div>
        <div class="form-group">
            <label>Price</label>
            <input type="number" id="editProductPrice" step="0.01" min="0" value="${product.price}" required>
        </div>
        <div class="form-group">
            <label>Stock Quantity</label>
            <input type="number" id="editProductStock" min="0" value="${product.stock_quantity}" required>
        </div>
        <div class="form-group">
            <label>Eco Rating (1-5)</label>
            <input type="number" id="editProductRating" min="1" max="5" value="${product.eco_rating}">
        </div>
        <button type="submit" class="btn">Save Changes</button>
        <button type="button" class="btn btn-light" onclick="loadAdminProducts()">Cancel</button>
    </form>
  `;

  $("#adminWorkArea").html(html);
  populateCategoryFilter(categoryFilterId);
  $(`#${categoryFilterId}`).val(product.category_id).change();
}

/**
 * Updates a product in the database for a user with admin privledges.
 * 
 * @param {SubmitEvent} event Submit event for the add product form element.
 * @description
 * Sends a POST request (data from edit product form element) to the server-side 
 * script: "adminGetProducts.php". Expects a JSON response with properties: 
 * "{ success: boolean, message: string }".
 * @see ../server/adminGetProducts.php
 */
function updateProduct(event) {
  event.preventDefault();

  const product = {
    action: "update",
    product_id: Number($("#editProductId").val()),
    product_name: $("#editProductName").val().trim(),
    category_id: Number($("#editProductCategory").val()),
    description: $("#editProductDescription").val().trim(),
    price: parseFloat($("#editProductPrice").val()),
    stock_quantity: parseInt($("#editProductStock").val()),
    image_url: "",
    specifications: "",
    eco_rating: parseInt($("#editProductRating").val()),
  };

  $.ajax({
    url: "../server/adminGetProducts.php",
    type: "POST",
    data: product,
    dataType: "json",
    success: function (response) {
      if (response.success) {
        showMessage(response.message, "success");
        loadProducts();
      } else {
        showMessage(response.message, "error");
      }
    },
    error: function (response) {
      showMessage(response.message, "error");
    },
  });
}

/**
 * Adds a product to the database for a user with admin privledges.
 * 
 * @param {SubmitEvent} event Submit event for the add product form element.
 * @description
 * Sends a POST request (data from add product form element) to the server-side 
 * script: "adminAddProduct.php". Expects a JSON response with properties: 
 * "{ success: boolean, message: string }".
 * @see ../server/adminAddProduct.php
 */
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
        showMessage(response.message, "success");
        loadProducts();
        loadAdminProducts();
      } else {
        showMessage(response.message, "error");
      }
    },
  });
}

/**
 * Deletes a specifed product from the database for a user with admin privledges.
 * 
 * @param {number} productId Product ID to delete.
 * @description
 * Sends a POST request (productId) to the server-side script: 
 * "adminDeleteProduct.php". Expects a JSON response with properties:
 * "{ success: boolean, message: string }".
 * @see ../server/adminDeleteProduct.php
 */
function deleteProduct(productId) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  $.ajax({
    url: "../server/adminDeleteProduct.php",
    type: "POST",
    data: { productId: productId },
    dataType: "json",
    success: function (response) {
      if (response.success) {
        showMessage(response.message, "success");
        loadProducts();
        loadAdminProducts();
      } else {
        showMessage(response.message, "error");
      }
    },
  });
}

/**
 * Loads user data into the manage users admin dashboard panel
 * 
 * @description
 * Sends a GET request to the server-side script: "adminGetUsers.php" to 
 * retrieve all users from the database.
 * Expects a JSON response with properties: "{ success: boolean, data: object }".
 * @see ../server/adminGetUsers.php
 */
function loadAdminUsers() {
  $.ajax({
    url: "../server/adminGetUsers.php",
    type: "GET",
    dataType: "json",
    success: function (response) {
      if (response.success) {
        displayAdminUsers(response.data);
      }
    },
  });
}

/**
 * Displays all users to the manage users admin dashboard panel
 * @param {array} users Array of users to display
 */
function displayAdminUsers(users) {
  let html = "<h3>Manage Users</h3>";
  html += '<table style="width: 100%; border-collapse: collapse;">';
  html += "<tr><th>ID</th><th>Username</th><th>Email</th><th>Type</th><th>Actions</th></tr>";

  users.forEach(function (user) {
    // prevent showing delete button on client side, server side also prevents self deletion
    const isSelf = Number(user.user_id) === Number(currentUser.userId);

    html += `
              <tr>
                  <td>${user.user_id}</td>
                  <td>${user.username}</td>
                  <td>${user.email}</td>
                  <td>${user.user_type}</td>
                  <td>
                      <button class="btn btn-secondary" onclick="editUser(${user.user_id})">Edit</button>
                      ${
                        isSelf
                          ? `<button class="btn btn-disabled">Delete</button>`
                          : `<button class="btn btn-danger" onclick="deleteUser(${user.user_id})">Delete</button>`
                      }
                  </td>
              </tr>
          `;
  });

  html += "</table>";
  $("#adminWorkArea").html(html);
}

function editUser(userId) {
  $.ajax({
    url: "../server/adminGetUserById.php",
    type: "GET",
    data: { userId: userId },
    dataType: "json",
    success: function (response) {
      if (response.success) {
        const user = response.data;
        showEditUserForm(user);
      } else {
        showMessage(response.message, "error");
      }
    },
  });
}

function showEditUserForm(user) {
  const html = `
        <h3>Edit User</h3>
        <form id="editUserForm" onsubmit="updateUser(event, ${user.user_id})">
            <div class="form-group">
                <label>Username</label>
                <input type="text" id="editUsername" value="${user.username}" required">
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="editUserEmail" value="${user.email}">
            </div>
            <div class="form-group">
                <label>Password (leave blank to keep current password)</label>
                <input type="password" id="editUserPassword" minlength="3">
            </div>
            <div class="form-group">
                <label>First Name</label>
                <input type="text" id="editUserFirstName" value="${user.first_name || ""}" required>
            </div>
            <div class="form-group">
                <label>Last Name</label>
                <input type="text" id="editUserLastName" value="${user.last_name || ""}" required>
            </div>
            <div class="form-group">
                <label>User Type</label>
                <select id="editUserType" required>
                    <option value="customer" ${user.user_type === "customer" ? "selected" : ""}>Customer</option>
                    <option value="staff" ${user.user_type === "staff" ? "selected" : ""}>Staff</option>
                </select>
            </div>
            <div class="form-group">
                <label>Phone</label>
                <input type="tel" id="editUserPhone" value="${user.phone || ""}">
            </div>
            <div class="form-group">
                <label>Address</label>
                <input type="text" id="editUserAddress" value="${user.address || ""}">
            </div>
            <div class="form-group">
                <label>City</label>
                <input type="text" id="editUserCity" value="${user.city || ""}">
            </div>
            <div class="form-group">
                <label>State</label>
                <input type="text" id="editUserState" value="${user.state || ""}">
            </div>
            <div class="form-group">
                <label>Postcode</label>
                <input type="text" id="editUserPostcode" value="${user.postcode || ""}">
            </div>
            <button type="submit" class="btn">Update User</button>
        </form>
    `;
  $("#adminWorkArea").html(html);
}

function updateUser(event, userId) {
  event.preventDefault();

  const userData = {
    action: "update",
    user_id: userId,
    username: $("#editUsername").val(),
    email: $("#editUserEmail").val(),
    password: $("#editUserPassword").val(),
    first_name: $("#editUserFirstName").val(),
    last_name: $("#editUserLastName").val(),
    user_type: $("#editUserType").val(),
    phone: $("#editUserPhone").val(),
    address: $("#editUserAddress").val(),
    city: $("#editUserCity").val(),
    state: $("#editUserState").val(),
    postcode: $("#editUserPostcode").val(),
  };

  $.ajax({
    url: "../server/adminUpdateUser.php",
    type: "POST",
    data: userData,
    dataType: "json",
    success: function (response) {
      if (response.success) {
        showMessage(response.message, "success");
        loadAdminUsers();
      } else {
        showMessage(response.message, "error");
      }
    },
  });
}

/**
 * Deletes a specified user from the database for a user with admin privileges
 * 
 * @param {number} userId User ID to delete
 * @description
 * Sends a POST request to the server-side script: 
 * "adminDeleteUser.php". Expects a JSON response with properties:
 * "{ success: boolean, message: string }".
 * @see ../server/adminDeleteUser.php
 */
function deleteUser(userId) {
  if (!confirm("Are you sure you want to delete this user?")) return;

  $.ajax({
    url: "../server/adminDeleteUser.php",
    type: "POST",
    data: { userId: userId },
    dataType: "json",
    success: function (response) {
      if (response.success) {
        showMessage(response.message, "success");
        loadAdminUsers();
      } else {
        showMessage(response.message, "error");
      }
    },
  });
}

/**
 * Loads all orders for the manage orders admin dashboard panel
 * @param {array} orders Array of orders to display
 */
function loadAdminOrders() {
  $.ajax({
    url: "../server/adminGetOrders.php",
    type: "GET",
    dataType: "json",
    success: function (response) {
      if (response.success) {
        displayAdminOrders(response.data);
      }
    },
  });
}

/**
 * Displays all orders to the manage orders admin dashboard panel
 * @param {array} orders Array of orders to display
 */
function displayAdminOrders(orders) {
  let html = "<h3>Ecotech Orders</h3>";
  html += '<table style="width: 100%; border-collapse: collapse;">';
  html += "<tr><th>Order ID</th><th>Date</th><th>User ID</th><th>Total</th><th>Status</th></tr>";

  orders.forEach(function (order) {
    html += `
              <tr>
                  <td>${order.order_id}</td>
                  <td>${order.order_date}</td>
                  <td>${order.user_id}</td>
                  <td>${parseFloat(order.total_amount).toFixed(2)}</td>
                  <td>${order.status}</td>
              </tr>
          `;
  });

  html += "</table>";
  $("#adminWorkArea").html(html);
}

// Utility functions

/**
 * Displays a message on the page with a specified message type.
 * 
 * @param {string} message Message to display.
 * @param {string} type Message type to display. One of: "success", "error".
 *  Defaults to "error".
 * @param {number} ms Timelength to display message in milliseconds. 
 *  Default value of 3000 (3 seconds).
 */
function showMessage(message, type, ms=3000) {
  const alertClass = type === "success" ? "alert-success" : "alert-error";
  const messageHtml = `<div class="alert ${alertClass}">${message}</div>`;

  // Add message to the top of the current section
  const currentSection = $("section.active");
  currentSection.prepend(messageHtml);

  // Auto-remove after 3 seconds (default)
  setTimeout(function () {
    currentSection
      .find(".alert")
      .first()
      .fadeOut(function () {
        $(this).remove();
      });
  }, ms);
}
