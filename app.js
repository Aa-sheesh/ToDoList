const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");
mongoose.set('useFindAndModify', false);

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://aashish:peedhu483@cluster0.b2sbzcu.mongodb.net/todolistDB", { useNewUrlParser: true });
const itemsSchema = {
    name: String
};
const Item = mongoose.model("Item", itemsSchema);

//pre-fed items
const Item1 = new Item({
    name: "Welcome to ToDoList v1!"
});
const Item2 = new Item({
    name: "Click + to add an item to the list."
});
const Item3 = new Item({
    name: "<---- Click this to delete an item from list."
});
const defaultItems = [Item1, Item2, Item3];

//custom List DB
const listSchema = {
    name: String,
    items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);


app.get('/', function (req, res) {
    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {

            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                }
            });

        } else {

            res.render("index.ejs", { listTitle: "Today", newListItems: foundItems });
        }
    })

}
)
app.post("/", function (req, res) {
    const Itemname = (req.body.newItem);
    const listName = req.body.list;
    
    const item = new Item({
        name: Itemname
    });
    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }


})
app.post("/delete", function (req, res) {
    const checkedItemId = (req.body.checkbox);
    const listName = req.body.listName;

    if(listName==="Today"){
        Item.findByIdAndRemove(checkedItemId, function (err) {
            if (!err) {
                res.redirect("/");
            }
        });
    }else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
            if(!err){
                res.redirect("/"+listName);
            }
        })
    }

    
})
app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize([string=req.params.customListName]);
    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            }
            else {
                res.render("index.ejs", { listTitle: foundList.name, newListItems: foundList.items });
            }
        }
    });

})
app.listen(3000, function () {
    console.log("Port is up and running at 3000!");
})

