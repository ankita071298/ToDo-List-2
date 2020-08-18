const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-ankita:*21*Annie*@cluster0.z2c8p.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const itemsSchema = new mongoose.Schema(
 	{
 		name: String
 	});

const Item = mongoose.model("item", itemsSchema);

const item1 = new Item(
	{
		name: "Go to a Morning Walk"
	});
const item2 = new Item(
	{
		name: "Learn a new Exercise"
	});
const item3 = new Item(
	{
		name: "Practice Yoga"
	});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema(
	{
		name: String,
		items: [itemsSchema]
	});

const List = mongoose.model("list", listSchema);

app.get("/", function(req,res)
	{
		Item.find({}, function(err,foundItems)
		{
			if(foundItems.length === 0)
			 {
			 	Item.insertMany(defaultItems, function(err)
				 {
					if(err)
						console.log(err);
					else
						console.log("Successfully saved default item to DB.");
				 });
			 	res.redirect("/");
			 }
			else
				res.render("list", {listTitle: "Today", newListItems: foundItems});
		});
	});

app.post("/", function(req,res)
	{
		const itemName = req.body.newItem;
		const listName = req.body.list;
		const item = new Item(
 		 { 
		 	name: itemName
		 });
		if(listName === "Today")
		 {
		 	item.save();
			res.redirect("/");
		 }
		else
		 {
		 	List.findOne({name: listName}, function(err, foundList)
		 	 {
		 	 	foundList.items.push(item);
		 	 	foundList.save();
		 	 	res.redirect("/" + listName);
		 	 });
		 }
	});

app.post("/delete", function(req,res)
	{
		const checkedItemId = req.body.checkbox;
		const listName = req.body.listName;
		if(listName === "Today")
		 {
		 	Item.findByIdAndRemove(checkedItemId, function(err)
			 {
				if(err)
					console.log(err);
				else
				 {
					console.log("Successfully removed items from todolistDB");
				 }
			 });
		 	res.redirect("/");
		 }
		else
		 {
		 	List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}, function(err,foundList)
			 {
				if(!err)
					res.redirect("/" +  listName);
				else
					console.log(err);
			 });
		 }
	});

app.get("/:listName" , function(req,res)
	{
		const listName = _.capitalize(req.params.listName);
		List.findOne({name: listName}, function(err,foundList)
		 {
			if(!err)
			 {
			 	if(!foundList)
			 	 {
			 		const list = new List(
					 {
						name: listName,
						items: []
					 });
			 		list.save();
			 		res.redirect("/" + listName);
			 	 }
			 	else
			 		res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
			 }
		 });
	});

app.get("/about",function(req,res)
	{
		res.render("about");
	});

let port = process.env.PORT;
if (port == null || port == "")
 {
	port = 3000;
 }
app.listen(port);

app.listen(port, function()
	{
		console.log("Server has started successfully.");
	});