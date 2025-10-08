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

// Load and display all users
function loadAdminUsers() {
  $.ajax({
    url: "../server/adminGetUsers.php",
    type: "GET",
    dataType: "json",
    success: function (response) {
      if (response.success) {
        displayAdminUsers(response.data);
      } else {
        showMessage("Failed to load users", "error");
      }
    },
    error: function () {
      showMessage("Error loading users", "error");
    },
  });
}

function displayAdminUsers(users) {
  let html = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <h3>Manage Users</h3>
      <button class="btn" onclick="showAddUserForm()">Add New User</button>
    </div>
  `;

  html += '<table style="width: 100%; border-collapse: collapse;">';
  html += `
    <tr style="background: #f5f5f5; text-align: left;">
      <th style="padding: 12px; border-bottom: 2px solid #ddd;">ID</th>
      <th style="padding: 12px; border-bottom: 2px solid #ddd;">Username</th>
      <th style="padding: 12px; border-bottom: 2px solid #ddd;">Email</th>
      <th style="padding: 12px; border-bottom: 2px solid #ddd;">Name</th>
      <th style="padding: 12px; border-bottom: 2px solid #ddd;">Type</th>
      <th style="padding: 12px; border-bottom: 2px solid #ddd;">Created</th>
      <th style="padding: 12px; border-bottom: 2px solid #ddd;">Actions</th>
    </tr>
  `;

  users.forEach(function (user) {
    const userType = user.user_type === "staff" ? "Staff" : "Customer";
    const typeColor = user.user_type === "staff" ? "#3498db" : "#27ae60";
    const createdDate = new Date(user.created_at).toLocaleDateString();

    html += `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px;">${user.user_id}</td>
        <td style="padding: 12px;"><strong>${user.username}</strong></td>
        <td style="padding: 12px;">${user.email}</td>
        <td style="padding: 12px;">${user.first_name || ""} ${user.last_name || ""}</td>
        <td style="padding: 12px;">
          <span style="background: ${typeColor}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">
            ${userType}
          </span>
        </td>
        <td style="padding: 12px;">${createdDate}</td>
        <td style="padding: 12px;">
          <button class="btn btn-secondary" style="margin-right: 0.5rem;" onclick="editUser(${
            user.user_id
          })">Edit</button>
          <button class="btn btn-danger" onclick="deleteUser(${user.user_id}, '${
      user.username
    }')">Delete</button>
        </td>
      </tr>
    `;
  });

  html += "</table>";
  $("#adminWorkArea").html(html);
}

function showAddUserForm() {
  const html = `
    <h3>Add New User</h3>
    <form id="addUserForm" onsubmit="addUser(event)" style="max-width: 600px;">
      <div class="form-group">
        <label>Username *</label>
        <input type="text" id="newUserUsername" required pattern="[a-zA-Z0-9]{3,20}" />
        <small style="color: #666;">3-20 characters, letters and numbers only</small>
      </div>
      <div class="form-group">
        <label>Email *</label>
        <input type="email" id="newUserEmail" required />
      </div>
      <div class="form-group">
        <label>Password *</label>
        <input type="password" id="newUserPassword" required minlength="4" />
      </div>
      <div class="form-group">
        <label>First Name</label>
        <input type="text" id="newUserFirstName" />
      </div>
      <div class="form-group">
        <label>Last Name</label>
        <input type="text" id="newUserLastName" />
      </div>
      <div class="form-group">
        <label>Phone</label>
        <input type="tel" id="newUserPhone" />
      </div>
      <div class="form-group">
        <label>User Type *</label>
        <select id="newUserType" required>
          <option value="customer">Customer</option>
          <option value="staff">Staff</option>
        </select>
      </div>
      <div style="display: flex; gap: 1rem;">
        <button type="submit" class="btn">Add User</button>
        <button type="button" class="btn btn-secondary" onclick="loadAdminUsers()">Cancel</button>
      </div>
    </form>
  `;
  $("#adminWorkArea").html(html);
}

function addUser(event) {
  event.preventDefault();

  const userData = {
    username: $("#newUserUsername").val(),
    email: $("#newUserEmail").val(),
    password: $("#newUserPassword").val(),
    firstName: $("#newUserFirstName").val(),
    lastName: $("#newUserLastName").val(),
    phone: $("#newUserPhone").val(),
    userType: $("#newUserType").val(),
  };

  $.ajax({
    url: "../server/adminAddUser.php",
    type: "POST",
    data: userData,
    dataType: "json",
    success: function (response) {
      if (response.success) {
        showMessage("User added successfully!", "success");
        loadAdminUsers();
      } else {
        showMessage(response.message || "Failed to add user", "error");
      }
    },
    error: function () {
      showMessage("Error adding user", "error");
    },
  });
}

function editUser(userId) {
  $.ajax({
    url: "../server/adminGetUser.php",
    type: "GET",
    data: { userId: userId },
    dataType: "json",
    success: function (response) {
      if (response.success) {
        showEditUserForm(response.data);
      } else {
        showMessage("Failed to load user", "error");
      }
    },
    error: function () {
      showMessage("Error loading user", "error");
    },
  });
}

function showEditUserForm(user) {
  const html = `
    <h3>Edit User</h3>
    <form id="editUserForm" onsubmit="updateUser(event, ${user.user_id})" style="max-width: 600px;">
      <div class="form-group">
        <label>Username</label>
        <input type="text" id="editUserUsername" value="${
          user.username
        }" readonly style="background: #f5f5f5;" />
        <small style="color: #666;">Username cannot be changed</small>
      </div>
      <div class="form-group">
        <label>Email *</label>
        <input type="email" id="editUserEmail" value="${user.email}" required />
      </div>
      <div class="form-group">
        <label>New Password</label>
        <input type="password" id="editUserPassword" minlength="4" />
        <small style="color: #666;">Leave blank to keep current password</small>
      </div>
      <div class="form-group">
        <label>First Name</label>
        <input type="text" id="editUserFirstName" value="${user.first_name || ""}" />
      </div>
      <div class="form-group">
        <label>Last Name</label>
        <input type="text" id="editUserLastName" value="${user.last_name || ""}" />
      </div>
      <div class="form-group">
        <label>Phone</label>
        <input type="tel" id="editUserPhone" value="${user.phone || ""}" />
      </div>
      <div class="form-group">
        <label>User Type *</label>
        <select id="editUserType" required>
          <option value="customer" ${
            user.user_type === "customer" ? "selected" : ""
          }>Customer</option>
          <option value="staff" ${user.user_type === "staff" ? "selected" : ""}>Staff</option>
        </select>
      </div>
      <div style="display: flex; gap: 1rem;">
        <button type="submit" class="btn">Update User</button>
        <button type="button" class="btn btn-secondary" onclick="loadAdminUsers()">Cancel</button>
      </div>
    </form>
  `;
  $("#adminWorkArea").html(html);
}

function updateUser(event, userId) {
  event.preventDefault();

  const userData = {
    userId: userId,
    email: $("#editUserEmail").val(),
    firstName: $("#editUserFirstName").val(),
    lastName: $("#editUserLastName").val(),
    phone: $("#editUserPhone").val(),
    userType: $("#editUserType").val(),
  };

  const newPassword = $("#editUserPassword").val();
  if (newPassword) {
    userData.password = newPassword;
  }

  $.ajax({
    url: "../server/adminUpdateUser.php",
    type: "POST",
    data: userData,
    dataType: "json",
    success: function (response) {
      if (response.success) {
        showMessage("User updated successfully!", "success");
        loadAdminUsers();
      } else {
        showMessage(response.message || "Failed to update user", "error");
      }
    },
    error: function () {
      showMessage("Error updating user", "error");
    },
  });
}

function deleteUser(userId, username) {
  if (
    !confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)
  ) {
    return;
  }

  $.ajax({
    url: "../server/adminDeleteUser.php",
    type: "POST",
    data: { userId: userId },
    dataType: "json",
    success: function (response) {
      if (response.success) {
        showMessage("User deleted successfully", "success");
        loadAdminUsers();
      } else {
        showMessage(response.message || "Failed to delete user", "error");
      }
    },
    error: function () {
      showMessage("Error deleting user", "error");
    },
  });
}

// Load and display all orders
function loadAdminOrders() {
  $.ajax({
    url: "../server/adminGetOrders.php",
    type: "GET",
    dataType: "json",
    success: function (response) {
      if (response.success) {
        displayAdminOrders(response.data);
      } else {
        showMessage("Failed to load orders", "error");
      }
    },
    error: function () {
      showMessage("Error loading orders", "error");
    },
  });
}

function displayAdminOrders(orders) {
  let html = `
    <div style="margin-bottom: 2rem;">
      <h3>Order Management</h3>
      <p style="color: #666; margin-top: 0.5rem;">Total Orders: ${orders.length}</p>
    </div>
  `;

  if (orders.length === 0) {
    html += '<p style="text-align: center; color: #999; padding: 3rem;">No orders found</p>';
    $("#adminWorkArea").html(html);
    return;
  }

  // Calculate summary stats
  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const processingCount = orders.filter((o) => o.status === "processing").length;

  html += `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
      <div style="background: #27ae60; color: white; padding: 1.5rem; border-radius: 8px;">
        <div style="font-size: 0.9rem; opacity: 0.9;">Total Revenue</div>
        <div style="font-size: 1.8rem; font-weight: bold; margin-top: 0.5rem;">$${totalRevenue.toFixed(
          2
        )}</div>
      </div>
      <div style="background: #f39c12; color: white; padding: 1.5rem; border-radius: 8px;">
        <div style="font-size: 0.9rem; opacity: 0.9;">Pending Orders</div>
        <div style="font-size: 1.8rem; font-weight: bold; margin-top: 0.5rem;">${pendingCount}</div>
      </div>
      <div style="background: #3498db; color: white; padding: 1.5rem; border-radius: 8px;">
        <div style="font-size: 0.9rem; opacity: 0.9;">Processing</div>
        <div style="font-size: 1.8rem; font-weight: bold; margin-top: 0.5rem;">${processingCount}</div>
      </div>
    </div>
  `;

  // Orders table
  html += '<div style="overflow-x: auto;">';
  html += '<table style="width: 100%; border-collapse: collapse; background: white;">';
  html += `
    <tr style="background: #f5f5f5; text-align: left;">
      <th style="padding: 12px; border-bottom: 2px solid #ddd;">Order ID</th>
      <th style="padding: 12px; border-bottom: 2px solid #ddd;">Customer</th>
      <th style="padding: 12px; border-bottom: 2px solid #ddd;">Date</th>
      <th style="padding: 12px; border-bottom: 2px solid #ddd;">Items</th>
      <th style="padding: 12px; border-bottom: 2px solid #ddd;">Total</th>
      <th style="padding: 12px; border-bottom: 2px solid #ddd;">Status</th>
      <th style="padding: 12px; border-bottom: 2px solid #ddd;">Shipping</th>
      <th style="padding: 12px; border-bottom: 2px solid #ddd;">Actions</th>
    </tr>
  `;

  orders.forEach(function (order) {
    const orderDate = new Date(order.order_date).toLocaleString();
    const statusColors = {
      pending: "#f39c12",
      processing: "#3498db",
      shipped: "#9b59b6",
      delivered: "#27ae60",
      cancelled: "#e74c3c",
    };
    const statusColor = statusColors[order.status] || "#95a5a6";
    const itemCount = order.items ? order.items.length : 0;
    const shippingAddr = order.shipping_address
      ? `${order.shipping_address}, ${order.shipping_city}, ${order.shipping_state} ${order.shipping_postcode}`
      : "N/A";

    html += `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px;"><strong>#${order.order_id}</strong></td>
        <td style="padding: 12px;">
          <div>${order.customer_name || "N/A"}</div>
          <div style="font-size: 0.85rem; color: #666;">${order.customer_email || ""}</div>
        </td>
        <td style="padding: 12px; font-size: 0.9rem;">${orderDate}</td>
        <td style="padding: 12px; text-align: center;">${itemCount}</td>
        <td style="padding: 12px;">
          <strong style="color: #27ae60;">$${parseFloat(order.total_amount).toFixed(2)}</strong>
        </td>
        <td style="padding: 12px;">
          <select onchange="updateOrderStatus(${order.order_id}, this.value)" 
                  style="background: ${statusColor}; color: white; border: none; padding: 6px 10px; 
                         border-radius: 4px; cursor: pointer; font-weight: bold;">
            <option value="pending" ${order.status === "pending" ? "selected" : ""}>Pending</option>
            <option value="processing" ${
              order.status === "processing" ? "selected" : ""
            }>Processing</option>
            <option value="shipped" ${order.status === "shipped" ? "selected" : ""}>Shipped</option>
            <option value="delivered" ${
              order.status === "delivered" ? "selected" : ""
            }>Delivered</option>
            <option value="cancelled" ${
              order.status === "cancelled" ? "selected" : ""
            }>Cancelled</option>
          </select>
        </td>
        <td style="padding: 12px; font-size: 0.85rem; max-width: 200px;">${shippingAddr}</td>
        <td style="padding: 12px;">
          <button class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.9rem;" 
                  onclick="viewOrderDetails(${order.order_id})">View Details</button>
        </td>
      </tr>
    `;
  });

  html += "</table>";
  html += "</div>";
  $("#adminWorkArea").html(html);
}

function updateOrderStatus(orderId, newStatus) {
  $.ajax({
    url: "../server/adminUpdateOrderStatus.php",
    type: "POST",
    data: {
      orderId: orderId,
      status: newStatus,
    },
    dataType: "json",
    success: function (response) {
      if (response.success) {
        showMessage("Order status updated successfully", "success");
        loadAdminOrders();
      } else {
        showMessage(response.message || "Failed to update order status", "error");
        loadAdminOrders();
      }
    },
    error: function () {
      showMessage("Error updating order status", "error");
      loadAdminOrders();
    },
  });
}

function viewOrderDetails(orderId) {
  $.ajax({
    url: "../server/adminGetOrderDetails.php",
    type: "GET",
    data: { orderId: orderId },
    dataType: "json",
    success: function (response) {
      if (response.success) {
        displayOrderDetails(response.data);
      } else {
        showMessage("Failed to load order details", "error");
      }
    },
    error: function () {
      showMessage("Error loading order details", "error");
    },
  });
}

function displayOrderDetails(order) {
  const orderDate = new Date(order.order_date).toLocaleString();
  const statusColors = {
    pending: "#f39c12",
    processing: "#3498db",
    shipped: "#9b59b6",
    delivered: "#27ae60",
    cancelled: "#e74c3c",
  };
  const statusColor = statusColors[order.status] || "#95a5a6";

  let html = `
    <div style="max-width: 900px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h3>Order Details - #${order.order_id}</h3>
        <button class="btn btn-secondary" onclick="loadAdminOrders()">Back to Orders</button>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
        <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px;">
          <h4 style="margin-bottom: 1rem; color: #2c3e50;">Order Information</h4>
          <p><strong>Order ID:</strong> #${order.order_id}</p>
          <p><strong>Date:</strong> ${orderDate}</p>
          <p><strong>Status:</strong> 
            <span style="background: ${statusColor}; color: white; padding: 4px 12px; border-radius: 4px; font-weight: bold;">
              ${order.status.toUpperCase()}
            </span>
          </p>
          <p><strong>Total Amount:</strong> <span style="color: #27ae60; font-size: 1.2rem; font-weight: bold;">$${parseFloat(
            order.total_amount
          ).toFixed(2)}</span></p>
        </div>

        <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px;">
          <h4 style="margin-bottom: 1rem; color: #2c3e50;">Customer Information</h4>
          <p><strong>Name:</strong> ${order.customer_name || "N/A"}</p>
          <p><strong>Email:</strong> ${order.customer_email || "N/A"}</p>
          <p><strong>Username:</strong> ${order.customer_username || "N/A"}</p>
        </div>

        <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px;">
          <h4 style="margin-bottom: 1rem; color: #2c3e50;">Shipping Address</h4>
          <p>${order.shipping_address || "N/A"}</p>
          <p>${order.shipping_city || ""}, ${order.shipping_state || ""} ${
    order.shipping_postcode || ""
  }</p>
        </div>
      </div>

      <div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 1.5rem;">
        <h4 style="margin-bottom: 1rem; color: #2c3e50;">Order Items</h4>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background: #f5f5f5;">
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
            <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Quantity</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Subtotal</th>
          </tr>
  `;

  if (order.items && order.items.length > 0) {
    order.items.forEach(function (item) {
      const subtotal = parseFloat(item.price) * parseInt(item.quantity);
      html += `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px;">
            <strong>${item.product_name}</strong>
          </td>
          <td style="padding: 12px; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; text-align: right;">$${parseFloat(item.price).toFixed(2)}</td>
          <td style="padding: 12px; text-align: right;"><strong>$${subtotal.toFixed(
            2
          )}</strong></td>
        </tr>
      `;
    });

    html += `
      <tr style="background: #f8f9fa;">
        <td colspan="3" style="padding: 12px; text-align: right;"><strong>Total:</strong></td>
        <td style="padding: 12px; text-align: right;">
          <strong style="color: #27ae60; font-size: 1.2rem;">$${parseFloat(
            order.total_amount
          ).toFixed(2)}</strong>
        </td>
      </tr>
    `;
  } else {
    html +=
      '<tr><td colspan="4" style="padding: 12px; text-align: center; color: #999;">No items found</td></tr>';
  }

  html += `
        </table>
      </div>
    </div>
  `;

  $("#adminWorkArea").html(html);
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
