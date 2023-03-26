require("dotenv").config();
const express = require('express');
const cors = require('cors')
const { Configuration, OpenAIApi } = require("openai");

const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());

const configuration = new Configuration({
    apiKey: process.env.CHATGPT_KEY,
});
const openai = new OpenAIApi(configuration);

app.post('/api/generate-function', async (req, res) => {
    const nameLanguage = req.query.nameLanguage ? req.query.nameLanguage : "JavaScript";
    const prompt = `Write a ${nameLanguage} function with a minimum of 200 characters, regardless of how it operates. Please only include the function in your response without any additional text.`;
    
    try {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            max_tokens: 200 
        });

        const completion = response.data.choices[0].text.trim();

        return res.status(200).json({
            success: true,
            message: completion,
        });
    } catch (error) {
        console.log(error.message);
    }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));