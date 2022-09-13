const express = require('express');
const con = require("../config/conn");

module.exports = {

    //add a minting details
    AddMint: async (req, res) => {
        const data = {
            address: req.query.address,
            image: req.query.image,
            name: req.query.name,
            description: req.query.description
        };
        con.query("INSERT INTO mints SET?", data, (error, result, fields) => {
            if (error) throw error;
            res.send(result);
        });
    },

    //get a minting details
    GetMint: async (req, res) => {
        let address = req.params.id;
        if (!address) {
            return res.status(400).send({
                error: true,
                message: 'Please provide address' });
        }
        con.query('SELECT * FROM mints where address=?', address, function (error, results, fields) {
            if (error) throw error;
            return res.send({
                error: false,
                data: results,
                message: 'mints list.' });
        });
    }

};