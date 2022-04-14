import express from 'express';
import bodyParser, { json } from 'body-parser';
import { MongoClient } from 'mongodb';
import path from 'path';
/* const articlesInfo = {
    'learn-react':{
        comments:[],
        upvotes:0,
    },
    'learn-node':{
        comments:[],
        upvotes:0,
    },
    'my-thoughts-on-resumes':{
        comments:[],
        upvotes:0,
    }
} */

const app = express();
app.use(express.static(path.join(__dirname, '/build')));
app.use(bodyParser.json());

const withDB = async (operations, res)=>{
    try{
    const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser:true })
    const db = client.db('my-blog');
  await operations(db);
    client.close();
    }
    catch(error){
        res.status(500).json({message: 'Error connecting to db', error});
    }
};


app.get('/api/articles/:name', async (req,res)=> {
    /* try{
        const articleName = req.params.name;
    const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser:true })
    const db = client.db('my-blog');
    const articleInfo = await db.collection('articles').findOne({ name: articleName });
    res.status(200).json(articleInfo);
    client.close();
    }
    catch(error){
        res.status(500).json({message: 'Error connecting to db', error});
    } */
    withDB( async (db)=>{
        const articleName = req.params.name;
        const articleInfo = await db.collection('articles').findOne({ name: articleName });
        res.status(200).json(articleInfo);
    }, res);
});

/* app.get('/hello', (req, res) => res.send('Hello!'));
app.post('/hello/:name', (req,res)=> res.send(`Hello ${req.params.name}`));
app.post('/hello', (req,res) => res.send(`${req.body.name}`));
 */

app.post('/api/articles/:name/upvote', async(req, res) =>{
   /*  articlesInfo[articleName].upvotes += 1;
    res.status(200).send(`${articleName} now has ${articlesInfo[articleName].upvotes} upvotes!`)
 *//* 
    const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser:true })
    const db = client.db('my-blog');

    const articleInfo = await db.collection('articles').findOne({name: articleName});
    await db.collection('articles').updateOne({ name: articleName },
       { '$set': { upvotes: articleInfo.upvotes + 1 },
    });
    const updateArticleInfo = await db.collection('articles').findOne({name: articleName});
    res.status(200).json(updateArticleInfo); */

    withDB( async (db)=>{
        const articleName = req.params.name;
        const articleInfo = await db.collection('articles').findOne({name: articleName});
        await db.collection('articles').updateOne({ name: articleName },
           { '$set': { upvotes: articleInfo.upvotes + 1 },
        });
        const updateArticleInfo = await db.collection('articles').findOne({name: articleName});
        res.status(200).json(updateArticleInfo);
    }, res)

})

app.post('/api/articles/:name/add-comment', (req, res) =>{
    const articleName = req.params.name;
    const { username, text } = req.body;
    /* const articleName = req.params.name;
    const { username, text } = req.body;
   articlesInfo[articleName].comments.push({ username, text });
   res.status(200).send(articlesInfo[articleName]) */
   withDB( async (db)=>{
    const articleInfo = await db.collection('articles').findOne({name: articleName});
    await db.collection('articles').updateOne({ name:articleName },
        {
            '$set':{ comments: articleInfo.comments.concat({ username, text }) },
        });
    const updateArticleInfo = await db.collection('articles').findOne({name: articleName})
    res.status(200).send(updateArticleInfo);
   }, res);
});

app.get('*', (req, res)=>{
    res.sendFile(path.join(__dirname + '/build/index.html'));
})

app.listen(8000, ()=> console.log('Listening on port 8000'));