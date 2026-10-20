export async function onRequestPost(context) {
  try {
    const { request } = context;
    const body = await request.json();
    const { apiKey, model, contents, systemInstruction } = body;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Ключ не передан' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiBase = 'https://generativelanguage.googleapis.com/v1beta/models/';
    const targetUrl = `${apiBase}${encodeURIComponent(model || 'gemini-3.5-flash-lite')}:generateContent`;

    // Сервер Cloudflare отправляет запрос в Google со своего европейского/американского IP
    const googleResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        systemInstruction: systemInstruction,
        contents: contents
      })
    });

    const data = await googleResponse.json();

    return new Response(JSON.stringify(data), {
      status: googleResponse.status,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
