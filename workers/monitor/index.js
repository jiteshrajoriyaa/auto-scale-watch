const prom_client = require('prom-client')
const { createLogger, transports, error } = require("winston");
const LokiTransport = require("winston-loki");

const options = {
    transports: [
        new LokiTransport({
        labels: {
            appName: 'express'
        },
      host: "http://loki:3100"
    })
  ]
};

const collectDefaultMetrics = prom_client.collectDefaultMetrics
collectDefaultMetrics({register: prom_client.register})

const reqResTime = new prom_client.Histogram({
    name: "http_express_response_time",
    help: "It will return how much did server took to response",
    labelNames: ["method", "route", "status_code"],
    buckets: [1, 50, 100, 200, 500, 800, 1000, 1500, 2000, 2500, 3000, 4000, 5000]

})

const totalReqCount = new prom_client.Counter({
    name: 'total_req_counter',
    help: "Helps to count no. of requests"
})

const logger = createLogger(options);

module.exports = {reqResTime, totalReqCount, logger, prom_client}
