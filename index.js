const express = require('express'); 
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u47wziv.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const allProductsCollection= client.db('watchEx').collection('allproducts');
        
        app.get('/advertisedProducts', async(req,res) => {
            const query = {};
            const advertisedProducts= await allProductsCollection.find(query).toArray();
            res.send(advertisedProducts);
        })

        app.get('/category/:id', async (req, res) => {
            const id = req.params.id;
            const query = { category_id: (id) };
            const categoryProducts = await allProductsCollection.find(query).toArray();
            res.send(categoryProducts);
        });
    }
    finally{

    }
}
run().catch(console.log);

app.get('/', async(req, res) => {
    res.send('Server running');
})

app.listen(port, () => console.log(`Server running on ${port}`));