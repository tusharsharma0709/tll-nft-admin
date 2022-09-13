const express = require('express');
const con = require("../config/conn");

module.exports = {

    //add a minting details
    AddLazyMint : async (req,res) => {
        const data = {
            address : req.query.address,
            tokenURI : req.query.tokenURI,
            price : req.query.price,
            signature : req.query.signature,
            name : req.query.name,
            description : req.query.description,
            cid_no : req.query.cid_no
        };
        con.query("INSERT INTO lazymints SET?",data,(error,result,fields)=>{
            if(error)throw error;
            res.send(result)
        })
    },

    //get a minting details
    GetLazyMint : async (req,res) => {
        let address = req.params.id;
        if (!address) {
            return res.status(400).send({ 
                error: true, 
                message: 'Please provide address' });
        }
        con.query('SELECT * FROM lazymints where address=?', address, function (error, results, fields) {
        if (error) throw error;
            return res.send({ 
                error: false, 
                data: results, 
                message: 'mints list.' });
        });

    }

    
}