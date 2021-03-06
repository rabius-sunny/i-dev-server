
const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config()

const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());


app.get('/', (req, res) => {
    res.send('Hello World!')
})

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASS}@cluster1.guizf.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority;`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    console.log('connection err: ', err)
    console.log('database connected')
    const booksCollection = client.db("booksdb").collection("books");
    const orderInfo = client.db("booksdb").collection("orders");

    // API call for different operations

    // Get all items
    app.get('/books', (req, res) => {
        booksCollection.find()
            .toArray((err, book) => {
                res.send(book)
            })
    })

    // Get an item by id
    app.get('/bookById/:id', (req, res) => {
        // const bookId = req.body
        booksCollection.find({ _id: ObjectId(req.params.id) })
            .toArray((err, book) => {
                res.send(book)
            })
    })

    // Get orders for specific user
    app.get('/orders', (req, res) => {
        orderInfo.find({ email: req.query.email })
            .toArray((err, orders) => res.send(orders))
    })

    // Adding an item
    app.post('/addBook', (req, res) => {
        const newBook = req.body;
        booksCollection.insertOne(newBook)
            .then(result => res.send(result.insertedCount))
    })

    // Deleting an item
    app.delete('/delete/:id', (req, res) => {
        booksCollection.deleteOne({ _id: ObjectId(req.params.id) })
            .then((err, result) => res.send(result.deletedCount))
    })

    // Adding Order Info to Database
    app.post('/addOrder', (req, res) => {
        const order = req.body
        orderInfo.insertOne(order)
            .then(result => res.send(result.insertedCount))
    })
})


app.listen(port, () => console.log('server is listening'))
