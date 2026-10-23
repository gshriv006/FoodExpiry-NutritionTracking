//  DATA 
function daysFromNow(n) {
  var d = new Date(); d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

var Staff = JSON.parse(localStorage.getItem('Staff')) || [
  { staff_id: 1, name: "Admin", username: "admin", password: "admin123", role: "Manager" },
  { staff_id: 2, name: "Ravi", username: "ravi", password: "ravi123", role: "Chef" }
];
var Category = JSON.parse(localStorage.getItem('Category')) || [
  { category_id: 1, name: "Dairy" },
  { category_id: 2, name: "Vegetables" },
  { category_id: 3, name: "Fruits" },
  { category_id: 4, name: "Pulses" },
  { category_id: 5, name: "Grains" },
  { category_id: 6, name: "Spices" }
];
var Nutrition = JSON.parse(localStorage.getItem('Nutrition')) || [ 
  { nutrition_id: 1, calories: 260, protein: 18, carbs: 1, fat: 20 },
  { nutrition_id: 2, calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  { nutrition_id: 3, calories: 116, protein: 9, carbs: 20, fat: 0.4 },
  { nutrition_id: 4, calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { nutrition_id: 5, calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3 }
];
var Food_Item = JSON.parse(localStorage.getItem('Food_Item')) || [
  { food_id: 1, name: "Paneer", category_id: 1, nutrition_id: 1, unit: "kg" },
  { food_id: 2, name: "Tomato", category_id: 2, nutrition_id: 2, unit: "kg" },
  { food_id: 3, name: "Toor Dal", category_id: 4, nutrition_id: 3, unit: "kg" },
  { food_id: 4, name: "Rice", category_id: 5, nutrition_id: 4, unit: "kg" },
  { food_id: 5, name: "Milk", category_id: 1, nutrition_id: 5, unit: "litre" }
];
var Food_Batch = JSON.parse(localStorage.getItem('Food_Batch')) || [
  { batch_id: 1, food_id: 1, quantity: 5, expiry_date: daysFromNow(2) },
  { batch_id: 2, food_id: 2, quantity: 10, expiry_date: daysFromNow(5) },
  { batch_id: 3, food_id: 3, quantity: 8, expiry_date: daysFromNow(-1) },
  { batch_id: 4, food_id: 4, quantity: 25, expiry_date: daysFromNow(120) },
  { batch_id: 5, food_id: 5, quantity: 12, expiry_date: daysFromNow(3) }
];
var Menu_Item = JSON.parse(localStorage.getItem('Menu_Item')) || [
  { menu_id: 1, name: "Paneer Butter Masala", price: 220 },
  { menu_id: 2, name: "Tomato Soup", price: 120 }
];
var Recipe = JSON.parse(localStorage.getItem('Recipe')) || [ 
  { menu_id: 1, food_id: 1, quantity: 0.2 },
  { menu_id: 1, food_id: 2, quantity: 0.15 },
  { menu_id: 2, food_id: 2, quantity: 0.3 }
];
var Orders = JSON.parse(localStorage.getItem('Orders')) || [];

var nextBatch = JSON.parse(localStorage.getItem('nextBatch')) || 6;
var nextOrder = JSON.parse(localStorage.getItem('nextOrder')) || 1;
var nextFood = JSON.parse(localStorage.getItem('nextFood')) || 6;
var nextNut = JSON.parse(localStorage.getItem('nextNut')) || 6;
var nextMenu = JSON.parse(localStorage.getItem('nextMenu')) || 3;
var currentStaff = null;

function saveDb() {
  localStorage.setItem('Staff', JSON.stringify(Staff));
  localStorage.setItem('Category', JSON.stringify(Category));
  localStorage.setItem('Nutrition', JSON.stringify(Nutrition));
  localStorage.setItem('Food_Item', JSON.stringify(Food_Item));
  localStorage.setItem('Food_Batch', JSON.stringify(Food_Batch));
  localStorage.setItem('Menu_Item', JSON.stringify(Menu_Item));
  localStorage.setItem('Recipe', JSON.stringify(Recipe));
  localStorage.setItem('Orders', JSON.stringify(Orders));
  localStorage.setItem('nextBatch', JSON.stringify(nextBatch));
  localStorage.setItem('nextOrder', JSON.stringify(nextOrder));
  localStorage.setItem('nextFood', JSON.stringify(nextFood));
  localStorage.setItem('nextNut', JSON.stringify(nextNut));
  localStorage.setItem('nextMenu', JSON.stringify(nextMenu));
}

// ---------- HELPERS ----------
function food(id) { return Food_Item.filter(function (f) { return f.food_id == id; })[0]; }
function cat(id) { return Category.filter(function (c) { return c.category_id == id; })[0]; }
function nut(id) { return Nutrition.filter(function (n) { return n.nutrition_id == id; })[0]; }
function menu(id) { return Menu_Item.filter(function (m) { return m.menu_id == id; })[0]; }
function round1(x) { return Math.round(x * 10) / 10; }

function status(dateStr) {
  var today = new Date(daysFromNow(0));
  var days = Math.round((new Date(dateStr) - today) / 86400000);
  if (days < 0) return "EXPIRED";
  if (days <= 3) return "Expiring soon (" + days + " days)";
  return "OK (" + days + " days)";
}

function totals(rows) {
  var t = { cal: 0, p: 0, c: 0, f: 0 };
  rows.forEach(function (r) {
    var n = nut(food(r.food_id).nutrition_id);
    t.cal += n.calories * r.grams / 100;
    t.p += n.protein * r.grams / 100;
    t.c += n.carbs * r.grams / 100;
    t.f += n.fat * r.grams / 100;
  });
  return t;
}
function totalsText(t) {
  return Math.round(t.cal) + " cal, " + round1(t.p) + "g protein, " + round1(t.c) + "g carbs, " + round1(t.f) + "g fat";
}

//  LOGIN & REGISTER
function register() {
  var n = document.getElementById("n").value;
  var u = document.getElementById("u").value;
  var p = document.getElementById("p").value;
  if (!n || !u || !p) {
    document.getElementById("err").textContent = "Please provide name, username, and password to register";
    return;
  }
  var exists = Staff.filter(function (s) { return s.username == u; })[0];
  if (exists) {
    document.getElementById("err").textContent = "Username already exists";
    return;
  }
  Staff.push({ staff_id: Staff.length + 1, name: n, username: u, password: p, role: "Staff" });
  saveDb();
  document.getElementById("err").textContent = "Successfully registered! You may now login.";
}

function login() {
  var u = document.getElementById("u").value;
  var p = document.getElementById("p").value;
  var found = Staff.filter(function (s) { return s.username == u && s.password == p; })[0];
  if (found) {
    currentStaff = found;
    document.getElementById("login").style.display = "none";
    document.getElementById("app").style.display = "block";
    document.getElementById("who").textContent = found.name + " (" + found.role + ")";
    show("inventory");
  } else {
    document.getElementById("err").textContent = "Wrong username or password";
  }
}
function logout() {
  currentStaff = null;
  document.getElementById("app").style.display = "none";
  document.getElementById("login").style.display = "block";
  document.getElementById("n").value = "";
  document.getElementById("p").value = "";
  document.getElementById("err").textContent = "";
}

// PAGES 
function show(name) {
  var page = document.getElementById("page");
  if (name == "inventory") page.innerHTML = inventoryPage();
  if (name == "nutrition") page.innerHTML = nutritionPage();
  if (name == "recipes") { page.innerHTML = recipesPage(); addRow(); }
  if (name == "orders") page.innerHTML = ordersPage();
}

function foodOptions() {
  var h = "";
  Food_Item.forEach(function (f) { h += "<option value='" + f.food_id + "'>" + f.name + "</option>"; });
  return h;
}

//  Inventory 
function inventoryPage() {
  var h = "<h3>Inventory (Food Batches)</h3><div class='wrap'><table><tr><th>Batch</th><th>Item</th><th>Category</th><th>Qty</th><th>Expiry Date</th><th>Status</th><th></th></tr>";
  Food_Batch.forEach(function (b) {
    var f = food(b.food_id);
    h += "<tr><td>" + b.batch_id + "</td><td>" + f.name + "</td><td>" + cat(f.category_id).name + "</td><td>" + b.quantity + " " + f.unit + "</td><td>" + b.expiry_date + "</td><td>" + status(b.expiry_date) + "</td><td><button onclick='delBatch(" + b.batch_id + ")'>Delete</button></td></tr>";
  });
  h += "</table></div><h3>Add Batch</h3>Item: <select id='nb_food'>" + foodOptions() + "</select>";
  h += " Qty: <input id='nb_qty' type='number' style='width:60px'> Expiry: <input id='nb_exp' type='date'> <button onclick='addBatch()'>Add</button>";
  return h;
}
function addBatch() {
  var q = document.getElementById("nb_qty").value;
  var e = document.getElementById("nb_exp").value;
  if (!q || !e) { alert("Fill in quantity and expiry date"); return; }
  Food_Batch.push({ batch_id: nextBatch++, food_id: document.getElementById("nb_food").value, quantity: Number(q), expiry_date: e });
  saveDb();
  show("inventory");
}
function delBatch(id) {
  Food_Batch = Food_Batch.filter(function (b) { return b.batch_id != id; });
  saveDb();
  show("inventory");
}

//  Nutrition + custom ingredients
function nutritionPage() {
  var h = "<h3>Nutrition (per 100g)</h3><div class='wrap'><table><tr><th>Item</th><th>Category</th><th>Calories</th><th>Protein (g)</th><th>Carbs (g)</th><th>Fat (g)</th></tr>";
  Food_Item.forEach(function (f) {
    var n = nut(f.nutrition_id);
    h += "<tr><td>" + f.name + "</td><td>" + cat(f.category_id).name + "</td><td>" + n.calories + "</td><td>" + n.protein + "</td><td>" + n.carbs + "</td><td>" + n.fat + "</td></tr>";
  });
  h += "</table></div><hr><h3>Add Your Own Ingredient</h3>";
  h += "Name: <input id='ni_name'><br>Category: <select id='ni_cat'>";
  Category.forEach(function (c) { h += "<option value='" + c.category_id + "'>" + c.name + "</option>"; });
  h += "</select> Unit: <select id='ni_unit'><option>kg</option><option>litre</option></select><br>";
  h += "Nutrition per 100g:<br>";
  h += "Calories: <input id='ni_cal' type='number' style='width:70px'> ";
  h += "Protein (g): <input id='ni_pro' type='number' style='width:70px'> ";
  h += "Carbs (g): <input id='ni_carb' type='number' style='width:70px'> ";
  h += "Fat (g): <input id='ni_fat' type='number' style='width:70px'><br>";
  h += "<button onclick='addIngredient()'>Add Ingredient</button>";
  return h;
}
function addIngredient() {
  var name = document.getElementById("ni_name").value.trim();
  var cal = document.getElementById("ni_cal").value;
  var pro = document.getElementById("ni_pro").value;
  var carb = document.getElementById("ni_carb").value;
  var fat = document.getElementById("ni_fat").value;
  if (name == "" || cal === "" || pro === "" || carb === "" || fat === "") {
    alert("Fill in the name and all the nutrition values");
    return;
  }
  if (cal < 0 || pro < 0 || carb < 0 || fat < 0) { alert("Values can't be negative"); return; }
  var exists = Food_Item.filter(function (f) { return f.name.toLowerCase() == name.toLowerCase(); }).length;
  if (exists > 0) { alert("That ingredient already exists"); return; }

  Nutrition.push({ nutrition_id: nextNut, calories: Number(cal), protein: Number(pro), carbs: Number(carb), fat: Number(fat) });
  Food_Item.push({ food_id: nextFood, name: name, category_id: Number(document.getElementById("ni_cat").value), nutrition_id: nextNut, unit: document.getElementById("ni_unit").value });
  nextNut++;
  nextFood++;
  saveDb();
  show("nutrition");
}

// Recipes + custom recipe builder 
function recipesPage() {
  var h = "<h3>Menu and Recipes</h3>";
  Menu_Item.forEach(function (m) {
    var rows = [];
    h += "<p><b>" + m.name + "</b> - Rs " + m.price + " <button onclick='delRecipe(" + m.menu_id + ")'>Delete</button></p>";
    h += "<div class='wrap'><table><tr><th>Ingredient</th><th>Amount (g/ml)</th></tr>";
    Recipe.filter(function (r) { return r.menu_id == m.menu_id; }).forEach(function (r) {
      var grams = r.quantity * 1000;
      rows.push({ food_id: r.food_id, grams: grams });
      h += "<tr><td>" + food(r.food_id).name + "</td><td>" + grams + "</td></tr>";
    });
    h += "</table></div><p>Total nutrition: " + totalsText(totals(rows)) + "</p>";
  });

  h += "<hr><h3>Create Your Own Recipe</h3>";
  h += "Dish name: <input id='r_name'> Price (Rs): <input id='r_price' type='number' style='width:80px'><br>";
  h += "<p>Ingredients:</p><div id='rows'></div>";
  h += "<button onclick='addRow()'>+ Add Ingredient</button>";
  h += "<p id='preview'>Total nutrition: add ingredients and grams to see it</p>";
  h += "<button onclick='saveRecipe()'>Save Recipe</button>";
  return h;
}
function addRow() {
  var div = document.createElement("div");
  div.innerHTML = "<select class='r_food' onchange='preview()'>" + foodOptions() + "</select> " +
    "<input class='r_g' type='number' placeholder='grams' style='width:80px' oninput='preview()'> g " +
    "<button onclick='this.parentNode.remove(); preview()'>X</button>";
  document.getElementById("rows").appendChild(div);
}
function readRows() {
  var foods = document.getElementsByClassName("r_food");
  var grams = document.getElementsByClassName("r_g");
  var rows = [];
  for (var i = 0; i < foods.length; i++) {
    var g = Number(grams[i].value);
    if (g > 0) rows.push({ food_id: foods[i].value, grams: g });
  }
  return rows;
}
function preview() {
  var rows = readRows();
  var text = rows.length == 0 ? "add ingredients and grams to see it" : totalsText(totals(rows));
  document.getElementById("preview").textContent = "Total nutrition: " + text;
}
function saveRecipe() {
  var name = document.getElementById("r_name").value.trim();
  var price = Number(document.getElementById("r_price").value);
  var rows = readRows();
  if (name == "" || price <= 0) { alert("Enter a dish name and a price"); return; }
  if (rows.length == 0) { alert("Add at least one ingredient with grams"); return; }
  Menu_Item.push({ menu_id: nextMenu, name: name, price: price });
  rows.forEach(function (r) {
    Recipe.push({ menu_id: nextMenu, food_id: r.food_id, quantity: r.grams / 1000 });
  });
  nextMenu++;
  saveDb();
  show("recipes");
}
function delRecipe(id) {
  if (!confirm("Delete this recipe?")) return;
  Menu_Item = Menu_Item.filter(function (m) { return m.menu_id != id; });
  Recipe = Recipe.filter(function (r) { return r.menu_id != id; });
  saveDb();
  show("recipes");
}

// Orders
function ordersPage() {
  var h = "<h3>New Order</h3>Dish: <select id='o_menu'>";
  Menu_Item.forEach(function (m) { h += "<option value='" + m.menu_id + "'>" + m.name + " (Rs " + m.price + ")</option>"; });
  h += "</select> Qty: <input id='o_qty' type='number' value='1' style='width:50px'> <button onclick='placeOrder()'>Place Order</button>";
  h += "<h3>All Orders</h3><div class='wrap'><table><tr><th>Order</th><th>Staff</th><th>Dish</th><th>Qty</th><th>Total</th><th>Status</th><th></th></tr>";
  Orders.forEach(function (o) {
    h += "<tr><td>" + o.order_id + "</td><td>" + o.staff + "</td><td>" + o.dish + "</td><td>" + o.quantity + "</td><td>Rs " + o.total_price + "</td><td>" + o.order_status + "</td><td>" +
      (o.order_status == "Pending" ? "<button onclick='doneOrder(" + o.order_id + ")'>Mark Done</button>" : "") + "</td></tr>";
  });
  return h + "</table></div>";
}
function placeOrder() {
  var m = menu(document.getElementById("o_menu").value);
  var q = Number(document.getElementById("o_qty").value);
  if (!m) { alert("No dishes on the menu"); return; }
  if (q < 1) { alert("Quantity must be at least 1"); return; }
  Orders.push({ order_id: nextOrder++, staff: currentStaff.name, menu_id: m.menu_id, dish: m.name, quantity: q, total_price: m.price * q, order_status: "Pending" });
  saveDb();
  show("orders");
}
function doneOrder(id) {
  Orders.forEach(function (o) { if (o.order_id == id) o.order_status = "Done"; });
  saveDb();
  show("orders");
}