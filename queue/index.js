const { createClient } = require("redis");
const express = require('express');
const authMiddleware = require("./middlewares/user-auth");
const responseTime = require('response-time');
const { totalReqCount, logger, reqResTime, prom_client } = require('./monitor');
const { Request } = require("./db");

const PORT = 8000

const app = express()
app.use(express.json())

const client = createClient({
    url: process.env.REDIS_URL
})
client.on('error', (error) => {
    console.error("Error in redis-client: ", error)
})

app.use(responseTime((req, res, time) => {
    totalReqCount.inc()
    reqResTime.labels({
        method: req.method,
        route: req.url,
        status_code: res.statusCode
    }).observe(time)
}))

app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).send('Something broke!');
});

app.post('/submit', authMiddleware, async (req, res) => {
    try {
        let data = req.body
        const userId = req.userId
        data.retries = 0;
        data.userId = userId;
        console.log(data.userId)
        
        try{
            const request = await Request.create(data)
            data.reqId = request._id

        }catch(e){
            return res.status(500).json({
                msg: "catch during inserting the request in the db"
            })
        }

        await client.sAdd('activeUsers', userId)
        await client.lPush(`queue:${userId}`, JSON.stringify(data))
        logger.info(`${JSON.stringify(data, null, 2)} is pushed in redis queue`)
        

        res.json({
            msg: "request submitted successfully"
        })

    } catch (e) {
        logger.error('Error in submission', { error: e.message })
        res.status(500).json({
            msg: "Error while submission the request / Check the format of request you are sending"
        })
    }

})



async function startServer() {
    try {
        await client.connect()
        logger.info('redis client is connected')
        app.listen(PORT, () => {
            logger.info('Queue server is started on port: 8000')
            console.log(`Server is listening on port: ${PORT}`)
        })
    } catch (e) {
        logger.error('redis-client is unable to connect')
        console.error("Connection failed: ", e)
    }
}

startServer()

app.get('/metrics', async (req, res) => {
    res.setHeader('Content-type', prom_client.register.contentType)
    const metrics = await prom_client.register.metrics()

    res.send(metrics)
})