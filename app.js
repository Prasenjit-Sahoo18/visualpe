// create an express app
const express = require("express");
const cors = require("cors");
const app = express();
const config = require("./config");
const axios = require("axios");
const localStorage = require("localStorage");

const createData = require("./util/consent_detail");
const requestData = require("./util/request_data");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(express.static("public"));

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://sayansree:${config.mongodb_secret}@cluster0.eywtc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

var db = null;
var users = null;
async function setup() {
  try {
    await client.connect();
    db = client.db("VisualPe");
    users = db.collection('users');
    console.log("Connected successfully to server");
  } catch(err) {
    await client.close();
  }
}
setup().catch(console.dir);

app.get("/", function (req, res) {
  res.send("Hello");
});

// Simplified consent flow without authentication
app.post("/consent/:mobileNumber", (req, res) => {
  let body = createData(req.params.mobileNumber);
  var requestConfig = {
    method: "post",
    url: config.api_url + "/consents",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": config.client_id,
      "x-client-secret": config.client_secret,
    },
    data: body,
  };
  axios(requestConfig)
    .then((response) => {
      let url = response.data.url;
      res.send({"url": url});
    })
    .catch(function (error) {
      console.log(error);
      console.log("Error AA create consent req");
      res.status(500).send("Error creating consent");
    });
});

////// CONSENT NOTIFICATION
var body = {}
app.post("/visualpay", (req, res) => {
   body = req.body;
  if (body.type === "CONSENT_STATUS_UPDATE") {
    if (body.data.status === "ACTIVE") {
      console.log("web: Consent ACTIVE notification");
      fi_data_request(body.consentId);
    } else {
      console.log("web: consent rejected");
    }
  }
  if (body.type === "SESSION_STATUS_UPDATE") {
    if (body.data.status === "COMPLETED") {
      console.log("web: FI COMPLETE notification");
      fi_data_fetch(body.dataSessionId, body.consentId);
    } else {
      console.log("web: FI PENDING notification");
    }
  }
  res.send("OK");
});

app.get("/visualpay", (req, res) => {
  res.send(body);
})

////// FI DATA REQUEST
const fi_data_request = async (consent_id) => {
  console.log("In FI data request");
  let request_body = requestData(consent_id);
  var requestConfig = {
    method: "post",
    url: config.api_url + "/sessions",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": config.client_id,
      "x-client-secret": config.client_secret,
    },
    data: request_body,
  };

  axios(requestConfig)
    .then(function (response) {
      console.log("Data request sent");
    })
    .catch(function (error) {
      console.log(error);
      console.log("web: Error data session request");
    });
};

////// FETCH DATA REQUEST
const fi_data_fetch = (session_id, consent_id) => {
  console.log("In FI data fetch");
  var requestConfig = {
    method: "get",
    url: config.api_url + "/sessions/" + session_id,
    headers: {
      "Content-Type": "application/json",
      "x-client-id": config.client_id,
      "x-client-secret": config.client_secret,
    },
  };
  axios(requestConfig)
    .then(function (response) {
      localStorage.setItem("jsonData", JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
      console.log("web: fetch data Error");
    });
};

///// GET DATA
app.get("/get-data/DEPOSIT", (req, res) => {
  res.send(JSON.parse(localStorage.getItem("jsonData")));
});

app.get("/get-data/:type", (req, res) => {
  res.send(config.fiData[req.params.type]);
});

app.listen(config.port || 5000, () => console.log("Server is running..."));