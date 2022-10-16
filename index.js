const express = require('express')
const app = express()
const port = 3000
const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;
const Registry = client.Registry;
const register = new Registry();
collectDefaultMetrics({ register });

const numberOfRequestsCounter = new client.Counter({
    name: 'number_of_requests',
    help: 'counts the number of requests that the fact endpoint recieved',
    labelNames: ['status'],
});
register.registerMetric(numberOfRequestsCounter)

const factorial = (number) => {
    let result = 1;
    for (let i = 1; i <= number; i++) {
        result *= i;
    }
    return result;
}

app.get('/factorial', (req, res) => {
    const number = req.query.n
    if (number == undefined) {
        numberOfRequestsCounter.inc({ 'status': 400 });
        return res.status(400).send({ "error": "number query parameter required" })
    }
    if (number < 0) {
        numberOfRequestsCounter.inc({ 'status': 400 });
        return res.status(400).send({ "error": "can't calculate factorial of a negative number" })
    }

    const fact = factorial(number)

    numberOfRequestsCounter.inc({ 'status': 200 });
    return res.send({ "response": fact })
})

app.get('/metrics', async (req, res) => {
    try {
        return res.status(200).send(await register.metrics())
    } catch (error) {
        return error
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})