export default async function handler(req, res) {
  try {
    // ElevenLabs のベースURL
    const baseUrl = "https://api.elevenlabs.io";

    // Bubble から渡されたパスをそのまま使う
    // 例: /v1/text-to-speech/xxxxx
    const targetPath = req.query.path;
    if (!targetPath) {
      return res.status(400).json({ error: "Missing 'path' query parameter" });
    }

    // 完成した ElevenLabs 側の URL
    const targetUrl = `${baseUrl}${targetPath}`;

    // リクエスト送信
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: req.method === "GET" ? undefined : JSON.stringify(req.body),
    });

    // ElevenLabs は音声データも返すため判定が必要
    const contentType = response.headers.get("Content-Type");

    if (contentType && contentType.includes("audio")) {
      const audio = await response.arrayBuffer();
      res.setHeader("Content-Type", contentType);
      return res.send(Buffer.from(audio));
    }

    // JSONレスポンス
    const data = await response.json();
    return res.status(response.status).json(data);

  } catch (error) {
    console.error("Proxy Error:", error);
    return res.status(500).json({ error: "Proxy server error", details: error.message });
  }
}
