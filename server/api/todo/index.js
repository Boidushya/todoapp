const mongoose= require('mongoose');
const express = require("express");
const router = express.Router();

mongoose.connect("mongodb://localhost:27017/todo", {useUnifiedTopology: true, useNewUrlParser: true});

const dataSchema = new mongoose.Schema({
	email: String,
	items:[{
		id: String,
		value:String
	}]
},{
	collection:"data"
});

const Model = new mongoose.model("data", dataSchema);

router.get("/",(req,res)=>{
	if(req.query.hasOwnProperty("email")){
		Model.findOne({email:req.query.email},(err,User)=>{
			if(err){
				console.log(err);
			}
			if(User){
				res.send(User.items)
			}
		})
	}
	else{
		res.send({
			err:"Invalid Email"
		})
	}
})

router.delete("/delete",(req,res)=>{
	Model.findOne({email:req.body.email},(err,User)=>{
		if(err){
			console.log(err);
		}
		if(User){
			User.items.splice(User.items.findIndex(item => item.id === req.body.id),1);
			User.save();
		}
	})
	res.send({
		status:"Deleted"
	})
})

router.post("/add",(req,res)=>{
	Model.findOne({email:req.body.email},(err,User)=>{
		if(err){
			console.log(err);
		}
		if(User){
			User.items.push(req.body.items);
			User.save();
		}
		else{
			const newUser = new Model({
				email:req.body.email,
				items:[req.body.items]
			});
			newUser.save((err)=>{
				console.log(err);
			})
		}
	})
	res.send({
		status:"Added"
	});
})

module.exports = router;
