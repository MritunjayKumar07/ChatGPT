const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv").config();
const bodyParser = require("body-parser");
const { Configuration, OpenAIApi } = require("openai");

const config = new Configuration({
  apiKey: process.env.SECRET_KEY,
});

const openai = new OpenAIApi(config);
const filePath = path.resolve(__dirname, "index.html");

//Setup Server:
const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  // res.send('<h1>Bad Request...</h1>')
  const filePath = path.resolve(__dirname, "index.html");
  res.sendFile(filePath);
});

//endPoint for ChatGpt
app.post("/Chat_GPT", async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log(prompt)

    if (!prompt) {
      return res
        .status(400)
        .json({ error: "Missing 'prompt' in the request..." });
    }
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      max_tokens: 4000,
      temperature: 0,
      prompt: prompt,
    });

    if (completion.data.choices[0]) {
      const generatedText = completion.data.choices[0].text;
      res.json({ success: true, generatedText });
      // res.send(completion.data.choices[0].text);
    } else {
      res.status(500).json({ error: "Unexpected API response format" });
    }
  } catch (error) {
    console.error("Error making API request:", error);
    if (error.response && error.response.data && error.response.data.error) {
      const errorMessage = `OpenAI API Error: ${error.response.data.error.message}`;
      res.status(400).json({
        success: false,
        error: errorMessage,
        details: error.response.data.error,
      });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`);
});
