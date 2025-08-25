import "dotenv/config";

const getPerplexityAPIResponse = async (message) => {
  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar-pro",
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    }),
  };
  try {
    const response = await fetch(
      "https://api.perplexity.ai/chat/completions",
      options
    );
    const data = await response.json();
    const reply =
      data?.choices?.[0]?.message?.content ||
      data?.output?.[0]?.content ||
      null;
    return reply;
  } catch (err) {
    console.log("perplexity error",err);
  }
};


export default getPerplexityAPIResponse;