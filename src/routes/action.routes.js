import express from "express";
const router = express.Router();
import extractContent from "../utils/extractContent.js";
import summarizeContent from "../utils/summarize.js";  // import summarize function
import { protectedRoute } from "../middleware/auth.middleware.js";
import Actions from "../model/action.model.js"
import * as cheerio from 'cheerio';


//register user actions
router.post("/", protectedRoute, async (req, res) => {
  const { url } = req.body;
  try {
    const content = await extractContent(url);
    //const summary = await summarizeContent(content.content);  // call summarizer here

    const dom = cheerio.load(content.content);
    const title = dom("h1").first().text().trim();

    const action = new Actions({
      user: req.user._id,       // user from protectedRoute middleware
      title: title,
      content: content.content, // assuming content has a .content string
      summary: content.content,         // save the summary here
    });

    await action.save();

    res.json({ content, summary: content });  // return both content and summary

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to extract and summarize content" });
  }
});

//get all user actions
router.get("/", protectedRoute, async (req, res) => {
  try {
    // Find all actions by this user, sorted by newest first
    const userActions = await Actions.find({ user: req.user._id }).sort({ createdAt: -1 });

    console.log("actions: ", userActions);

    res.json(userActions);
  } catch (error) {
    console.error("Error fetching user actions:", error);
    res.status(500).json({ message: "Failed to fetch user actions" });
  }
});






export default router;
