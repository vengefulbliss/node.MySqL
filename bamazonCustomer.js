//mySQL homework
var mysql = require("mysql");
var prompt = require("prompt");

//  connection
var connection = mysql.createConnection({
	host: "127.0.0.1",
	user: "root",
	password: "Zapyaplee1992!",
	database: "Bamazon"
});
// Connecting to the Bamazon Database
connection.connect(function (err) {
	if (err) {
		console.log('Error connecting to Db');
		return;
	}
	console.log('Connection established');

	var schema = {
		properties: {
			ID: {
				message: "Enter the id# of the product you want to purchase.",
				pattern: '^[0-9]+$',
				required: true
			},
			howMany: {
				message: "How many you would like to buy?",
				pattern: '^[0-9]+$',
				required: true
			}
		}
	};

	var schema2 = {
		properties: {
			AnotherPurchase: {
				message: "Would you like to buy another item?.",
				pattern: /(no|n|yes|y)/,
				required: true
			},
		}
	};

	// Function stop to the app
	var stopApp = function () {
		return next(err);
	}
	// Function to start the app
	var beginApp = function () {
		connection.query("SELECT * FROM Products", function (err, result) {
			if (err) throw err;
			return (getBamazonProducts(result));

		});
	}

	// display the items available.
	var getBamazonProducts = function (products) {
		console.log("Hello, Welcome to Bamazon! Here are all of the products, their costs, and current stock.");
		for (var i = 0; i < products.length; i++) {
			var productsResults = "\r\n" +
				"ItemID: " + products[i].ItemID + "\r\n" +
				"Product Description: " + products[i].ProductName + "\r\n" +
				"Department: " + products[i].DepartmentName + "\r\n" +
				"Price: $ " + products[i].Price + "\r\n" +
				"Current Stock: " + products[i].StockQuantity;
			console.log(productsResults);
		}
		userSelectID();
	}

	// Function to get the user selection
	var userSelectID = function () {
		prompt.start();
		console.log("Please enter the ID of the product you would like to buy.");

		prompt.get(schema, function (err, result) {
			if (err) {
				console.log(err)
			}
			//console.log(result);
			var userChoiceID = parseInt(result.ID);
			var userChoiceHowMany = parseInt(result.howMany);
			// console.log("id=" + userChoiceID + " how many=" + userChoiceHowMany);



			// Function to check the inventory of an item
			var checkInventory = function () {
				connection.query('SELECT * FROM Products WHERE ItemID =' + userChoiceID, function (err, result) {
					if (err) throw err;
					//console.log(result);

					var userWantsToBuy = userChoiceHowMany;
					var productInventory = result[0].StockQuantity;
					var productsPrice = result[0].Price;
					var isInStock = productInventory - userWantsToBuy;
					var totalCost = productsPrice * userWantsToBuy;

					if (userWantsToBuy > productInventory || productInventory === 0) {
						console.log("The item you are looking for is no longer in stock." + "\r\n" + "\r\n");
						userSelectID();
					} else {
						console.log("There are " + result[0].StockQuantity + " of " + result[0].ProductName);
						console.log("You are purchasing " + userWantsToBuy + " " + result[0].ProductName + "s at $" + result[0].Price + " per item.");
						console.log("Your total is $" + totalCost);
						connection.query('UPDATE Products SET StockQuantity = ' + isInStock + ' WHERE ItemID =' + userChoiceID, function (err, result) {
							if (err) throw err;
							connection.query('SELECT ItemID, ProductName, DepartmentName, Price, StockQuantity FROM products WHERE ItemID =' + userChoiceID, function (err, result) {});
						});
						prompt.get(schema2, function (err, result) {
							if (err) {
								console.log(err)
							}
							console.log(result);
							var userAnswer = result.AnotherPurchase;
							if (userAnswer === "n" || userAnswer === "no") {
								stopApp();
							} else {
								beginApp();
							}
						});
					}
				});
			};
			checkInventory();
		});
	}

	// start the app
	beginApp();
});