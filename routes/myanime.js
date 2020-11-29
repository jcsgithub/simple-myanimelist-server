var express = require('express');
var firebase = require('firebase');
var router = express.Router();

const firebaseConfig = {
  apiKey: "AIzaSyBA9V0egPlTgHAkeOtva-NggAGZZtUbzFs",
  authDomain: "simple-myanimelist.firebaseapp.com",
  databaseURL: "https://simple-myanimelist.firebaseio.com",
  projectId: "simple-myanimelist",
  storageBucket: "simple-myanimelist.appspot.com",
  messagingSenderId: "734940639447",
  appId: "1:734940639447:web:b6c6295bc6d5fb69e8c092",
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

/* GET anime list. */
router.get('/', async (req, res, next) => {
  let docs = []
  const snapshot = await db.collection("animes").get();
  if (snapshot.docs.length) {
    snapshot.forEach((doc) => {
      docs.push({ 
        id: doc.id, 
        ...doc.data()
      });
    });
  }
  res.send(docs);
});

/* QUERY anime list with query */
router.post('/query', async (req, res, next) => {
  let docs = []
  let snapshot = db.collection("animes");
  const body = req.body;

  // filter queries
  if (body.type === "manga") 
    snapshot = snapshot.where("type", "==", "Manga");
  else if (body.type === "anime") 
    snapshot = snapshot.where("type", "in", ["TV", "Movie"]);

  if (body.subtype === "watched") 
    snapshot = snapshot.where("is_watched", "==", true);
  else if (body.subtype === "notwatched") 
    snapshot = snapshot.where("is_watched", "==", false);

  if (body.sort === "title1")
    snapshot = snapshot.orderBy("title", "asc");
  else if (body.sort === "title2")
    snapshot = snapshot.orderBy("title", "desc");

  snapshot = await snapshot.get();

  if (snapshot.docs.length) {
    snapshot.forEach((doc) => {
      docs.push({ 
        id: doc.id, 
        ...doc.data()
      });
    });
  }
  res.send(docs);
});

/* GET specific anime. */
router.get('/anime/:id', async (req, res, next) => {
  const id = req.params.id;
  const doc = await db.collection("animes").doc(id).get();
  let response = { isFound: false, msg: "No anime found.", data: {} };
  if (doc.exists) {
    response = { 
      isFound: true, 
      msg: "Anime found.", 
      data: doc.data()
    };
  }
  res.send(response);
});

/* ADD new anime. */
router.post('/add', async function(req, res, next) {
  console.log('adding...')
  const id = req.body.mal_id.toString();
  const doc = await db.collection('animes').doc(id).set(req.body);
  res.send({ status: 200, msg: "Added to watchlist." });
});

/* UPDATE anime. */
router.put('/update/:id', async (req, res, next) => {
  console.log('updating...')
  const id = req.params.id;
  const doc = db.collection("animes").doc(id);
  const response = await doc.update({ is_watched: req.body.is_watched });
  res.send({ status: 200, msg: "Updated anime." });
});

/* DELETE anime. */
router.get('/delete/:id', async (req, res, next) => {
  console.log('deleting...')
  const id = req.params.id;
  const doc = await db.collection("animes").doc(id).delete();
  res.send({ status: 200, msg: "Deleted from watchlist." });
});

module.exports = router;
