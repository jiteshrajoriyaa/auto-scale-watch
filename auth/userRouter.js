const express = require('express')
const app = express()
app.use(express.json())
const { z } = require('zod')
const { User } = require('./db')
const jwt = require('jsonwebtoken')
const { totalReqCount, logger, reqResTime, prom_client } = require('./monitor');
const responseTime = require('response-time')


const signupSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(8)
})

const signinSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
})

app.use(responseTime((req, res, time)=>{
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


app.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const { success } = signupSchema.safeParse(req.body)

        if (!success) {
            return res.status(401).json({
                msg: "Please enter valid data"
            })
        }

        const existingUser = await User.findOne({
            email
        })

        if (existingUser) {
            return res.status(409).json({
                msg: "User already exist"
            })
        }

        const user = await User.create({
            name,
            email,
            password
        })
        const userId = user._id
        const token = jwt.sign({ email, userId }, process.env.JWT_STRING)
        logger.info(`user: ${userId} is created in successfully`)
        return res.json({
            msg: "user created successfully",
            token
        })

    } catch (e) {
        logger.error("Internal server error in signup route", { error: error.message })
        return res.status(500).json({
            msg: "Internal server error"
        })
    }
})

app.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        const { success } = signinSchema.safeParse({email, password})

        if (!success) {
            return res.status(401).json({
                msg: "Please enter valid data"
            })
        }

        const existingUser = await User.findOne({
            email,
            password
        })

        if (!existingUser) {
            return res.status(409).json({
                msg: "email or password is wrong"
            })
        }

        const userId = existingUser._id
        const token = jwt.sign({ email, userId }, process.env.JWT_STRING)
        logger.info(`user: ${userId} is logged in successfully`)
        return res.json({
            msg: "user logged in successfully",
            token
        })

    } catch (e) {
        logger.error("Internal server error in signin route", { error: error.message })
        return res.status(500).json({
            msg: "Internal server error"
        })
    }
})

app.get('/metrics', async (req, res)=>{
    res.setHeader('Content-type', prom_client.register.contentType)
    const metrics = await prom_client.register.metrics()
    res.send(metrics)
})


app.listen(3001, () => {
    logger.info("auth server started on 3001")
    console.log(`auth server is listening on 3001`)
})

module.exports = app