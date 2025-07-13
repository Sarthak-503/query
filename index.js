const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(bodyParser.json()); // user sends json in body, it get parsed easily
app.use(cors());

const posts = {};
// Posts structure
// posts ==== {
//     id:'2132',
//     title:'sasasa',
//     comments:[
//         {id:'dsds',content:'dsd'}
//     ]
// }

const handleEvent = (type, data) => {
  if (type === "PostCreated") {
    const { id, title } = data;
    posts[id] = {
      id,
      title,
      comments: [],
    };
  } else if (type === "CommentCreated") {
    const { id, postId, content, status } = data;
    const post = posts[postId];
    post.comments.push({
      id,
      content,
      status,
    });
  } else if (type === "CommentUpdated") {
    const { id, postId, content, status } = data;
    const post = posts[postId];
    const comment = post.comments.find((comment) => {
      return comment.id === id;
    });
    comment.status = status;
    comment.content = content;
  }
};
app.get("/posts", (req, res) => {
  res.send(posts);
});
app.post("/events", async (req, res) => {
  const { type, data } = req.body;
  handleEvent(type, data);
  console.log(posts);
  res.send({});
});

app.listen(4002, async () => {
 console.log("Listening on 4002");
  try {
    const res = await axios.get("http://localhost:4005/events");
 
    for (let event of res.data) {
      console.log("Processing event:", event.type);
 
      handleEvent(event.type, event.data);
    }
  } catch (error) {
    console.log(error.message);
  }
});
