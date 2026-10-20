export async function onRequestPost(context) {
  try {
    const { request } = context;
    const { apiKey, model, mimeType, base64Data } = await request.json();

    const apiBase = 'https://generativelanguage.googleapis.com/v1beta/models/';
    const targetUrl = `${apiBase}${encodeURIComponent(model || 'gemini-3.5-flash-lite')}:generateContent`;

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inlineData: { mimeType: mimeType, data: base64Data } },
            { text: `Проанализируй изображение персонажа. Верни ответ СТРОГО в виде валидного JSON без markdown: {"name": "Имя", "desc": "Описание", "prompt": "Характер и стиль речи с действиями в *звёздочках*", "greeting": "Приветствие с действиями в *звёздочках*"}` }
          ]
        }]
      })
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
