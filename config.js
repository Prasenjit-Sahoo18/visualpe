"use strict";

require("dotenv").config();

const config = {
    // Server Configuration
    server: {
        port: process.env.PORT || 5000,
        environment: process.env.NODE_ENV || 'development',
        cors: {
            origin: process.env.CORS_ORIGIN || '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE']
        }
    },

    // API Configuration
    api: {
        baseUrl: process.env.API_URL,
        version: 'v1',
        timeout: 30000, // 30 seconds
        headers: {
            'Content-Type': 'application/json',
            'x-client-id': process.env.CLIENT_ID,
            'x-client-secret': process.env.CLIENT_SECRET
        }
    },

    // Database Configuration
    database: {
        mongodb: {
            uri: `mongodb+srv://sayansree:${process.env.MDB_SECRET}@cluster0.eywtc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
            options: {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverApi: require('mongodb').ServerApiVersion.v1
            }
        }
    },

    // Application URLs
    urls: {
        baseUrl: process.env.BASE_URL || 'http://localhost:5000',
        frontend: {
            home: '/index.html',
            dashboard: '/dashboard.html'
        },
        api: {
            consent: '/consent',
            data: '/get-data'
        }
    },

    // Financial Data Types
    dataTypes: {
        DEPOSIT: 'DEPOSIT',
        TERM_DEPOSIT: 'TERM_DEPOSIT',
        RECURRING_DEPOSIT: 'RECURRING_DEPOSIT',
        CREDIT_CARD: 'CREDIT_CARD',
        MUTUAL_FUNDS: 'MUTUAL_FUNDS',
        // ... add other data types
    },

    // Data Templates
    fiData: {
        // Your existing fiData object
        // Consider organizing it into separate files if it gets too large
        TERM_DEPOSIT: {/* ... */},
        RECURRING_DEPOSIT: {/* ... */},
        // ... other data templates
    },

    // Utility Functions
    utils: {
        isProduction: () => process.env.NODE_ENV === 'production',
        isDevelopment: () => process.env.NODE_ENV === 'development',
        formatDate: (date) => new Date(date).toISOString(),
        validateConfig: () => {
            const requiredEnvVars = ['API_URL', 'CLIENT_ID', 'CLIENT_SECRET', 'MDB_SECRET'];
            const missing = requiredEnvVars.filter(key => !process.env[key]);
            if (missing.length) {
                throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
            }
        }
    }
};

// Validate configuration on load
config.utils.validateConfig();

// Freeze configuration to prevent modifications
Object.freeze(config);

// Export for both browser and Node.js environments
if (typeof window !== 'undefined') {
    window.appConfig = config;
}

module.exports = config;