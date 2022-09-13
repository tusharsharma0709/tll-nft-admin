const express = require('express');
const con = require("../config/conn");
const Uone = require("../uone.js");
const db = require("../models");
const Sequelize = db.sequelize;
const QueryTypes = db.Sequelize.QueryTypes;

const logger = Uone.logger;

module.exports = {
    //approval
    AddApproval : async (req,res) => {
        const data = {
            address : req.query.address,
            email : req.query.email,
            name : req.query.name
        };
        con.query("INSERT INTO approvals SET?",data,(error,result,fields)=>{
            if(error)throw error;
            // console.log(result)
            res.send(result)
        })
    },

    //get a particular approval details 
    GetApproval : async (req,res) => {
        let address = req.params.id;
        if (!address) {
            return res.status(400).send({ 
                error: true, 
                message: 'Please provide address' });
        }
        con.query('SELECT * FROM approvals where address=?', address, function (error, results, fields) {
        if (error) throw error;
            return res.send({ 
                error: false, 
                data: results, 
                message: 'approval' });
        });

    },

    //get all approval details 
    getList : async (req,res) => {
        con.query('SELECT * FROM approvals', function (error, results, fields) {
        if (error) throw error;
            return res.send({ 
                error: false, 
                data: results, 
                message: 'approval list.' });
        });

    },

    //get a particular approval details 
    UpdateStatus : async (req,res) => {
        let address = req.params.id;
        if (!address) {
            return res.status(400).send({ 
                error: true, 
                message: 'Please provide address' });
        }
        const data = {
            status : req.query.status
        }
        con.query(`UPDATE approvals SET status=? where address=?`,[req.query.status,address], function (error, results, fields) {
        if (error) throw error;
            return res.send({ 
                error: false, 
                data: results, 
                message: 'approval' });
        });

    },

    getAllApprovalLists: async (req, res) => {
        logger.info('[uone][controllers/approvalControllers/getAllApprovalList]');
        var page_header_data = { 
                                'page_title' : 'All Approve List', 
                                'breadcrumb1': '<a href="/dashboard" class="text-muted">Dashboard</a>', 
                                'breadcrumb2': 'Approve List',
                                'req': req
                            };
                            
                            res.render('pages/requests/requestList', page_header_data);
      
      },

      populateAllList: async (req, res) => {
        logger.info('[uone][controllers/approvalControllers/populateAllList]');
          let input = req.body;
          let limit = parseInt(input.length);
          let skip = parseInt(input.start);
          let serial_number = skip;
          let query = `SELECT * FROM approvals`;
      
          
          logger.info('[uone][controllers/approvalControllers/populateAllList Query] '+query);
      
          
          con.query('SELECT * FROM approvals', function (error, results, fields){
                    //console.log(results)
                //   users = JSON.parse(JSON.stringify(users));
                //   let recordsFiltered = users.length;
                //   console.log("List records");
                //   console.log(recordsFiltered);
                let formatted_result = [];
                let response=results
                
                response.forEach(  (element,index) => {
                        
                //       //shop.productImagesTemp  = shop.productImages;
                      formatted_result.push([
                                          index+1,
                                          element.address,
                                          element.email,
                                          element.name,
                                          `<div class="dropdown dropdown-inline">
                                                              <a href="javascript:;" class="btn btn-sm btn-clean btn-icon" data-toggle="dropdown">
                                                              <button class="label ${element.status==0?'label-warning':'label-success'} label-pill label-inline mr-2" data-user_public_address=${element.address} id="currentStatus" style="border:0 !important" >${element.status=='0'?"Unapprove":"Approve"}</button>
                                                </a>
                                                            <div class="dropdown-menu dropdown-menu-sm dropdown-menu-right">
                                                                <ul class="nav nav-hoverable flex-column">
                                                                <li class="nav-item"><button data-user_public_address="${element.address}" class="nav-link change_user_status change_status label ${element.status==0?'label-success':'label-warning'} label-pill label-inline mr-2" style="border:0 !important; text-align:'center'" href="#" data-id="${element.id}" data-cmd="${element.status==0 ? '1':'0'}"><i class="nav-icon fas fa-ban"></i><span class="nav-text">${element.status==0 ? 'Approve':'Unapprove'}</span></button></li>
                                              </ul>
                                                            </div>
                                                        </div>`
                      ])
      
                  });
                  
                //   //console.log("collectable length"+formatted_result.length);
                  res.json({
                                      "draw": input.draw,
                                      "recordsTotal": results.length,
                                      "recordsFiltered": results.length,
                                      "data": formatted_result
                                  });

      
              });
               
      },

      UpdateListStatus: async (req, res) => {
        logger.info('[uone][controllers/user.controller/UpdateListStatus]');
        logger.info("[uone][controllers/user.controller/UpdateListStatus] id to update is"+ req.body.id);
        logger.info("[uone][controllers/user.controller/UpdateListStatus] cmd to update is"+ req.body.cmd);
        // var query = {};
        // var update = {};
        console.log("List Update")
        console.log(req.body.user_public_address)
        
        //unapprove
        if(req.body.cmd == "0") {
            console.log("approval")
            console.log(req)
           con.query(`UPDATE approvals SET status=? where address=?`,[req.body.cmd,req.body.user_public_address])
        }
        else
        if(req.body.cmd == "1")
        {
            console.log("approval")
            console.log(req)
           con.query(`UPDATE approvals SET status=? where address=?`,[req.body.cmd,req.body.user_public_address])
        }
      
        res.json({ success: true });
      }
      

    
}


  