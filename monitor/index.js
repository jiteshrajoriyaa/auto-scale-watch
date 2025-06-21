const prom_client = require('prom-client')
const { createLogger, transports, error } = require("winston");
const LokiTransport = require("winston-loki");

const options = {
    transports: [
        new LokiTransport({
        labels: {
            appName: 'express'
        },
      host: "http://127.0.0.1:3100"
    })
  ]
};

const collectDefaultMetrics = prom_client.collectDefaultMetrics
collectDefaultMetrics({register: prom_client.register})

const reqResTime = new prom_client.Histogram({
    name: "http_express_response_time",
    help: "It will return how much did server took to response",
    labelNames: ["method", "route", "status_code"]
})

const totalReqCount = new prom_client.Counter({
    name: 'total_req_counter',
    help: "Helps to count no. of requests"
})

const logger = createLogger(options);

module.exports = {reqResTime, totalReqCount, logger}
