/**
 * MIT License
 * 
 * Copyright (c) 2017 Caio Gomes
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 * @Author: Caio M. Gomes
 * @Project: Concurseiro Bot and API
 * @Data: December 2017
 * 
 * This software aims to give to the user the availeable public contests in Brazil
 * working like an API software.
 **/

"use strict";

const express = require('express');
const fs      = require('fs');
const request = require('request');
const cheerio = require('cheerio');
// const app     = express();
var app = module.exports = express();
const _       = require('lodash');
const mongo   = require('mongodb');

let db = undefined;
let mongo_client = undefined;
const port = 8080;

// setup the app configs
// var env = process.env.NODE_ENV || 'development';
var env = 'production';
var config = require('./config')[env];

/*******************************************************
 * Connection to Database Instructions and functions   *
 *******************************************************/
const MongoClient = mongo.MongoClient;
const assert = require('assert');

// Connection URI
const uri = config.database.uri;

// Database Name
const dbName = config.database.db;

const findDocuments = function(db, restriction, callback) {
  // Get the documents collection
  const collection = db.collection('documents');
  // Find some documents
  collection.find(restriction).toArray(function(err, docs) {
    assert.equal(err, null);
    callback(docs);
  });
};

MongoClient.connect(uri, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    
    db = client.db(dbName);
    mongo_client = client;
});
/********************************************************/

/**
 * Allow Any Origin
 */
const cors = require('cors');
app.use(cors());


app.get('/api_concurso', (request, response) => {
  console.log("new connection at API");
  let estado = "";
  let publico = "";
  
  if(request.query.estado !== undefined) {
    estado = request.query.estado;
  }
  if(request.query.publico !== undefined) {
    publico = request.query.publico;
  }
  
  /*****************
   * Code to check the database existence of contest
   * and if not insert it and put the status of some
   * new contest in the country.
   ******************/
  let search_restriction = {'profissionais': {'$regex': publico, '$options': 'i'}, 'estado':{'$regex': estado}, 'ativo': 1};
  
  findDocuments(db, search_restriction, 
  (result) => {
    let clone = [];
    for(let i = 0; i < result.length; i++) {
      clone[i] = {
        'estado': result[i].estado,
        'nome': result[i].nome,
        'profissionais': result[i].profissionais,
        'link': result[i].link,
        'vagas': result[i].vagas,
        'data_inicio': result[i].data_inicio
      }
    }
    response.json(clone);
  });
  
});

app.listen(port || process.env.port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`API server is listening on ${port}`)
})
