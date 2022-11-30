const express = require('express'); 
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u47wziv.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'forbidden access'});
        }

        req.decoded = decoded;
        next();
    })
}

async function run(){
    try{
        const allProductsCollection= client.db('watchEx').collection('allproducts');
        const bookingsCollection= client.db('watchEx').collection('bookings');
        const usersCollection= client.db('watchEx').collection('users');

        app.get('/advertisedProducts', async(req,res) => {
            const query = {};
            const advertisedProducts= await allProductsCollection.find(query).toArray();
            res.send(advertisedProducts);
        })

        app.post('/products', async(req, res) => {
            const newService = req.body;
            const result = await allProductsCollection.insertOne(newService);
            res.send(result);
        })

        app.get('/myproducts', async(req, res) =>{
            let query ={};
            if(req.query.email){
                query ={
                    seller_email: req.query.email
                }
            }
            const cursor =allProductsCollection.find(query).sort( { _id : 1 } );
            const products = await cursor.toArray();
            res.send(products);
        })

        app.delete('/myproducts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await allProductsCollection.deleteOne(query);
            res.send(result);
        })

        app.patch('/myproducts/:id', async (req, res) => {
            const id = req.params.id;
            const status = req.body.status
            const query = { _id: ObjectId(id) }
            const updatedDoc = {
                $set:{
                    status: status
                }
            }
            const result = await reviewCollection.updateOne(query, updatedDoc);
            res.send(result);
        })

        app.get('/category/:id', async (req, res) => {
            const id = req.params.id;
            const query = { category_id: (id) };
            const categoryProducts = await allProductsCollection.find(query).toArray();
            res.send(categoryProducts);
        });

        app.get('/bookings', verifyJWT, async(req, res) => {
            const email= req.query.email;
            const decodedEmail = req.decoded.email;
            if(email !== decodedEmail){
                return res.status(403).send({message: 'forbidden access'}); 
            }
            const query = {email: email};
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        })

        app.post('/bookings', async(req, res) => {
            const booking = req.body
            console.log(booking);
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        }),

        app.get('/jwt', async(req,res) => {
            const email = req.query.email;
            const query = {email: email};
            const user = await usersCollection.findOne(query);
            if(user){
                const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: '1h'})
                return res.send({accessToken: token});
            }
            res.status(403).send({accessToken: ''})
        })

        app.get('/allsellers', async(req, res) => {
            const result = await usersCollection.find( { role: "seller" } ).toArray();
            res.send(result);
        })

        app.get('/allbuyers', async(req, res) => {
            const result = await usersCollection.find( { role: "buyer" } ).toArray();
            res.send(result);
        })

        app.get('/users', async(req,res) => {
            const query = {};
            const allUsers= await usersCollection.find(query).toArray();
            res.send(allUsers);
        })

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        })

        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isSeller: user?.role === 'seller' });
        })

        app.get('/users/buyer/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isBuyer: user?.role === 'buyer' });
        })

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.send(result);
        })

        app.post('/users', async(req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

    }
    finally{

    }
}
run().catch(console.log);

app.get('/', async(req, res) => {
    res.send('Server running');
})

app.listen(port, () => console.log(`Server running on ${port}`));