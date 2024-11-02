const express = require("express");
const cors = require("cors");
const axios = require("axios");
const localStorage = require("localStorage");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { MongoClient, ServerApiVersion } = require('mongodb');
const helmet = require('helmet');
const rateLimit = require("express-rate-limit");

const config = require("./config");
const createData = require("./util/consent_detail");
const requestData = require("./util/request_data");

class AppServer {
    constructor() {
        this.app = express();
        this.setupMiddleware();
        this.setupDatabase();
        this.setupRoutes();
        this.body = {};
    }

    setupMiddleware() {
        this.app.use(helmet());
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.static("public"));

        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100 // limit each IP to 100 requests per windowMs
        });
        this.app.use(limiter);
    }

    async setupDatabase() {
        const uri = `mongodb+srv://${config.mongodb_user}:${config.mongodb_secret}@${config.mongodb_cluster}/myFirstDatabase?retryWrites=true&w=majority`;
        this.client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverApi: ServerApiVersion.v1
        });

        try {
            await this.client.connect();
            this.db = this.client.db("VisualPe");
            this.users = this.db.collection('users');
            console.log("Connected successfully to MongoDB");
        } catch (err) {
            console.error("Database connection error:", err);
            await this.client.close();
            process.exit(1);
        }
    }

    verifyToken(req, res, next) {
        const token = req.headers['authorization']?.split(' ')[1];
        
        if (!token) {
            return res.status(403).json({ 
                success: false, 
                message: 'No token provided' 
            });
        }

        jwt.verify(token, config.JWT_secret, (err, decoded) => {
            if (err) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Failed to authenticate token' 
                });
            }
            req.userId = decoded.id;
            next();
        });
    }

    setupRoutes() {
        this.app.get("/", (req, res) => {
            res.send("VisualPe API Server");
        });

        this.app.post("/login", async (req, res) => {
            try {
                const { phone, pin } = req.body;
                
                const user = await this.users.findOne({ phone });
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: "User not found"
                    });
                }

                const validPin = await bcrypt.compare(pin, user.pin);
                if (!validPin) {
                    return res.status(401).json({
                        success: false,
                        message: "Invalid PIN"
                    });
                }

                const token = jwt.sign(
                    { id: user._id, phone: user.phone },
                    config.JWT_secret,
                    { expiresIn: '24h' }
                );

                res.json({
                    success: true,
                    token,
                    user: {
                        phone: user.phone,
                        name: user.name
                    }
                });
            } catch (error) {
                console.error("Login error:", error);
                res.status(500).json({
                    success: false,
                    message: "Internal server error"
                });
            }
        });

        this.app.post("/consent/:mobileNumber", this.verifyToken, async (req, res) => {
            try {
                const body = createData(req.params.mobileNumber);
                const response = await axios({
                    method: "post",
                    url: `${config.api.baseUrl}/consents`,
                    headers: {
                        "Content-Type": "application/json",
                        "x-client-id": config.api.headers['x-client-id'],
                        "x-client-secret": config.api.headers['x-client-secret'],
                    },
                    data: body,
                });

                res.json({ 
                    success: true, 
                    url: response.data.url 
                });
            } catch (error) {
                console.error("Consent error:", error);
                res.status(500).json({
                    success: false,
                    message: "Error creating consent"
                });
            }
        });

        this.app.post("/visualpay", (req, res) => {
            this.body = req.body;
            
            if (this.body.type === "CONSENT_STATUS_UPDATE") {
                if (this.body.data.status === "ACTIVE") {
                    console.log("Consent ACTIVE notification");
                    this.fi_data_request(this.body.consentId);
                } else {
                    console.log("Consent rejected");
                }
            }

            if (this.body.type === "SESSION_STATUS_UPDATE") {
                if (this.body.data.status === "COMPLETED") {
                    console.log("FI COMPLETE notification");
                    this.fi_data_fetch(this.body.dataSessionId, this.body.consentId);
                } else {
                    console.log("FI PENDING notification");
                }
            }

            res.send("OK");
        });

        this.app.get("/visualpay", this.verifyToken, (req, res) => {
            res.json(this.body);
        });

        this.app.get("/get-data/DEPOSIT", this.verifyToken, (req, res) => {
            try {
                const data = JSON.parse(localStorage.getItem("jsonData"));
                res.json({ success: true, data });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Error fetching deposit data"
                });
            }
        });

        this.app.get("/get-data/:type", this.verifyToken, (req, res) => {
            try {
                const data = config.fiData[req.params.type];
                if (!data) {
                    return res.status(404).json({
                        success: false,
                        message: "Data type not found"
                    });
                }
                res.json({ success: true, data });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Error fetching data"
                });
            }
        });
    }

    async fi_data_request(consent_id) {
        try {
            const request_body = requestData(consent_id);
            await axios({
                method: "post",
                url: `${config.api.baseUrl}/sessions`,
                headers: {
                    "Content-Type": "application/json",
                    "x-client-id": config.api.headers['x-client-id'],
                    "x-client-secret": config.api.headers['x-client-secret'],
                },
                data: request_body,
            });
            console.log("Data request sent successfully");
        } catch (error) {
            console.error("FI data request error:", error);
        }
    }

    async fi_data_fetch(session_id, consent_id) {
      try {
          const response = await axios({
              method: "get",
              url: `${config.api.baseUrl}/sessions/${session_id}`,
              headers: {
                  "Content-Type": "application/json",
                  "x-client-id": config.api.headers['x-client-id'],
                  "x-client-secret": config.api.headers['x-client-secret'],
              },
          });
          localStorage.setItem("jsonData", JSON.stringify(response.data));
          console.log("Data fetched and stored successfully");
      } catch (error) {
          console.error("FI data fetch error:", error);
      }
  }

  start() {
      const port = config.port || 5000;
      this.app.use(this.handleError);
      this.app.listen(port, () => {
          console.log(`Server is running on port ${port}`);
      });
  }

  handleError(error, req, res, next) {
      console.error('Server error:', error);
      res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
  }
}

// Create and start server instance
const server = new AppServer();
server.start();

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

module.exports = server;