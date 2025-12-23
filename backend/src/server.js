// const express = require('express');
import express from "express";
import { ENV } from "./lib/env.js";


const app = express();

app.get("/", function(req, res){
    res.status(200).json({msg: "success from backend 123"})
})

app.listen(3000 , () => {
    console.log('Server is running:', ENV.PORT)
})