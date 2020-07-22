const bodyParser = require('body-parser');
const compression = require('compression');
const correlator = require('express-correlation-id');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const helmet = require('helmet');
const noCache = require('nocache');

const loadConfig = (defaultValue = {}) => {
    let result = dotenv.config();
    if (result.error) {
        throw result.error;
    }
    return Object.assign(process.env, defaultValue);
};

let Index = class RestExpress {
    /**
     *
     * @param BODY_SIZE_LIMIT
     * @param DEFAULT_ERROR_MESSAGE
     * @param logger
     * @param ingestException
     * @param PORT
     */
    constructor ({ BODY_SIZE_LIMIT = '100kb', DEFAULT_ERROR_MESSAGE = 'Internal Server Error', logger = console, ingestException = () => {}, PORT = 4000 } = {}) {
        this.BODY_SIZE_LIMIT = BODY_SIZE_LIMIT;
        this.DEFAULT_ERROR_MESSAGE = DEFAULT_ERROR_MESSAGE;
        this.logger = logger;
        this.ingestException = ingestException;
        this.PORT = PORT;

        this.app = express();
    }

    getServer () {
        return this.app;
    }

    pre () {
        // enable xssFilter, hide powered by header, Disable Caching etc.
        this.app.use(helmet());
        this.app.use(noCache());
        this.app.use(cors());
        this.app.set('trust proxy', true);
        this.app.use(compression({ threshold: 1 }));
        this.app.use(bodyParser.json({ limit: (this.BODY_SIZE_LIMIT) }));
        this.app.use(correlator());
        return this;
    }

    use (...fn) {
        this.app.use(...fn);
        return this;
    }

    post () {
        let logger = this.logger;
        this.app.all('*', function (req, res, next) {
            logger.info('404 on', req.path);
            let err = new Error();
            err.status = 404;
            next(err);
        });

        this.app.use(function (err, req, res, next) {
            if (err.status !== 404) {
                return next(err);
            }
            err.message ? res.status(err.status).send(err.message) : res.sendStatus(err.status);
        });
        return this;
    }

    terminating () {
        let DEFAULT_ERROR_MESSAGE = this.DEFAULT_ERROR_MESSAGE;
        let logger = this.logger;
        let ingestException = this.ingestException;
        this.app.use(function (err, req, res, next) {
            let acceptJson = req.accepts('application/json');
            let message = err.message || DEFAULT_ERROR_MESSAGE;
            const correlationId = (req.correlationId && req.correlationId()) || undefined;
            res.status(err.status || 500).send(acceptJson ? { message, correlationId } : message);

            let suffix = correlationId ? `[${correlationId}]` : '';

            logger.error(`error ${suffix}`, err.message || err);
            logger.error(`error ${suffix}`, (err.stack));
            try {
                ingestException(err);
            } catch (e) {}

        });
        return this;
    }

    listen () {
        let { logger, PORT } = this;
        this.app.listen(PORT, () => {
            logger.info('Server in \'%s\' mode, %s is Ready', process.env.NODE_ENV, ('localhost:' + PORT));
        });
    }

    router(){
        return express.Router();
    }
};

module.exports = {
    loadConfig,
    RestServer: Index,
};