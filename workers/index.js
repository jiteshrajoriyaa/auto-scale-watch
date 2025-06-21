const { createClient } = require("redis");
const processRequest = require("./utills");
const express = require('express');
const app = express()
const { totalReqCount, logger, reqResTime, prom_client } = require('./monitor');
const responseTime = require("response-time");
const { Request } = require("./db");
const client = createClient({
    url: process.env.REDIS_URL
})

MAX_RETRIES = 3

async function processQueues() {
    try {
        while (true) {
            const userIds = await client.sMembers('activeUsers')

            for (const userId of userIds) {
                try {
                    const request = await client.rPop(`queue:${userId}`)
                    if (!request) {
                        await client.sRem('activeUsers', userId)
                        logger.info(`queue removed from redis set: queue:${userId}`)
                        continue;
                    }

                    const job = JSON.parse(request)

                    try {
                        console.log("Request is being processed.")
                        const timeTaken = await processRequest()
                        console.log(`userId: ${userId}, timeTaken: ${timeTaken}`)
                        console.log(job)
                        console.log("request processed")
                        logger.info(JSON.stringify(job, null, 2))
                        logger.info("request processed")
                        console.log()
                    } catch (e) {
                        console.error('Error during processing a request in queue:', userId)
                        console.error('Error:', e.message)
                        logger.error(`Error during processing a request in queue:${userId}`)

                        if (job.retries < MAX_RETRIES) {
                            job.retries += 1;
                            await client.lPush(`queue:${userId}`, JSON.stringify(job))
                            logger.info(`Same request pushed again to queue:${userId}`)
                            logger.info(job)
                        } else {
                            try{

                                await Request.findOneAndUpdate({
                                    _id: job.reqId
                            },
                            {
                                    $set: {
                                        retries: 3
                                    }
                                }
                                
                            )
                        }catch(e){
                            logger.info('Updated retries to 3 in mongodb')
                        }
                            const delQueueKey = `delQueue:${userId}`
                            client.lPush(delQueueKey, JSON.stringify(job))
                            console.warn(`Moved to delQueue: ${delQueueKey}`)
                            logger.warn(`Move to delQueue:  ${delQueueKey}`)
                        }
                    }
                } catch (e) {
                    console.error('Error while popping requests: ', e)
                    logger.error('Error while popping requests: ', e)
                }
            }
            await new Promise((resolve) => setTimeout(resolve, 500))
        }
    } catch (e) {
        console.error("Internal server error: ", e)
    }
}

async function startWorker() {
    try {
        await client.connect()
        processQueues()
    } catch (e) {
        console.error("Connection Error: ", e)
        logger.error("Connection failed in worker container: ", e)
    }
}

startWorker()

app.use(responseTime((req, res, time) => {
    totalReqCount.inc()
    reqResTime.labels({
        method: req.method,
        route: req.url,
        status_code: res.statusCode
    }).observe(time)
}))

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.get('/metrics', async (req, res) => {
    res.setHeader('Content-type', prom_client.register.contentType)
    const metrics = await prom_client.register.metrics()
    res.send(metrics)
})

app.listen(5000, () => {
    logger.info("Worker is started")
    console.log("Worker listening on 5000")
})