export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Grab the prompt from the request body
  const { prompt } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  try {
    // Call OpenAI's API
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // must be set in Vercel
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // make sure this model name is valid
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await openaiRes.json();

    // If OpenAI returns an error, surface it
    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    // Return the reply if available
    const reply = data.choices?.[0]?.message?.content;
    res.status(200).json({ reply: reply || "No reply from OpenAI" });
  } catch (err) {
    // Catch server-side errors
    res.status(500).json({ error: "Server error: " + err.message });
  }
}
