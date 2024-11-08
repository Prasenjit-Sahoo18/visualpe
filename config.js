"use strict";

require("dotenv").config();

const config = {
    // Server Configuration
    server: {
        port: process.env.PORT || 5000,
        environment: process.env.NODE_ENV || 'development',
        cors: {
            origin: process.env.CORS_ORIGIN?.split(',') || ['*'],
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true,
            maxAge: 86400 // 24 hours
        },
        security: {
            jwtSecret: process.env.JWT_SECRET,
            jwtExpiry: process.env.JWT_EXPIRY || '24h',
            bcryptRounds: 10,
            rateLimit: {
                windowMs: 15 * 60 * 1000, // 15 minutes
                max: 100 // limit each IP to 100 requests per windowMs
            }
        }
    },

    // API Configuration
    api: {
        baseUrl: process.env.API_URL,
        version: 'v1',
        timeout: parseInt(process.env.API_TIMEOUT) || 30000,
        retryAttempts: 3,
        headers: {
            'Content-Type': 'application/json',
            'x-client-id': process.env.CLIENT_ID,
            'x-client-secret': process.env.CLIENT_SECRET
        },
        endpoints: {
            consent: '/consents',
            sessions: '/sessions',
            data: '/data'
        }
    },

    auth: {
        routes: {
            login: '/login.html',
            dashboard: '/index.html'
        },
        tokenKey: 'jwt',
        cookieOptions: {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    },

    // Database Configuration
    database: {
        mongodb: {
            uri: `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MDB_SECRET}@${process.env.MONGODB_CLUSTER}/myFirstDatabase?retryWrites=true&w=majority`,
            options: {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverApi: require('mongodb').ServerApiVersion.v1,
                maxPoolSize: 10,
                connectTimeoutMS: 5000,
                socketTimeoutMS: 45000
            },
            collections: {
                users: 'users',
                transactions: 'transactions',
                consents: 'consents'
            }
        }
    },

    // Application URLs
    urls: {
        baseUrl: process.env.BASE_URL || 'http://localhost:5000',
        frontend: {
            home: '/index.html',
            dashboard: '/dashboard.html',
            login: '/login.html',
            error: '/error.html'
        },
        api: {
            consent: '/consent',
            data: '/get-data',
            auth: '/auth',
            webhook: '/webhook'
        },
        redirects: {
            success: '/success',
            failure: '/failure',
            callback: '/callback'
        }
    },

    // Financial Data Configuration
    finance: {
        dataTypes: {
            DEPOSIT: 'DEPOSIT',
            TERM_DEPOSIT: 'TERM_DEPOSIT',
            RECURRING_DEPOSIT: 'RECURRING_DEPOSIT',
            CREDIT_CARD: 'CREDIT_CARD',
            MUTUAL_FUNDS: 'MUTUAL_FUNDS',
            INSURANCE: 'INSURANCE',
            BONDS: 'BONDS',
            EQUITY: 'EQUITY'
        },
        dateRanges: {
            default: {
                from: '2021-04-01T00:00:00Z',
                to: '2021-10-01T00:00:00Z'
            }
        },
        consentModes: ['STORE', 'VIEW'],
        consentTypes: ['TRANSACTIONS', 'PROFILE', 'SUMMARY']
    },

    // Chart Configuration
    charts: {
        colors: {
            primary: ['rgba(255, 99, 132, 0.5)', 'rgba(54, 162, 235, 0.5)'],
            secondary: ['rgba(255, 206, 86, 0.5)', 'rgba(75, 192, 192, 0.5)']
        },
        updateInterval: 300000, // 5 minutes
        animations: {
            duration: 1000,
            easing: 'easeInOutQuart'
        }
    },

    // Cache Configuration
    cache: {
        ttl: 3600, // 1 hour in seconds
        checkPeriod: 600, // 10 minutes
        maxItems: 100
    },

    // Logging Configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        filename: 'app.log',
        maxSize: '10m',
        maxFiles: '7d'
    },

    // Utility Functions
    utils: {
        isProduction: () => process.env.NODE_ENV === 'production',
        isDevelopment: () => process.env.NODE_ENV === 'development',
        formatDate: (date) => new Date(date).toISOString(),
        validateConfig: () => {
            const requiredEnvVars = [
                'API_URL',
                'CLIENT_ID',
                'CLIENT_SECRET',
                'MDB_SECRET',
                'JWT_SECRET',
                'MONGODB_USER',
                'MONGODB_CLUSTER'
            ];
            const missing = requiredEnvVars.filter(key => !process.env[key]);
            if (missing.length) {
                throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
            }
        },
        sanitizeData: (data) => {
            // Add data sanitization logic
            return data;
        }
    }
};

// Validate configuration on load
config.utils.validateConfig();

// Freeze configuration to prevent modifications
Object.freeze(config);

// Export configuration
if (typeof window !== 'undefined') {
    // Browser environment - only expose safe configs
    window.appConfig = {
        environment: config.server.environment,
        urls: config.urls,
        charts: config.charts,
        finance: {
            dataTypes: config.finance.dataTypes
        }
    };
}

module.exports = config;
