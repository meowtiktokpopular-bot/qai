export async function onRequest(context) {
  const { request, env } = context;
  const method = request.method;

  try {

    if (method === 'GET') {
      const { results } = await env.DB.prepare(
        "SELECT * FROM bots WHERE is_public = 1 ORDER BY created_at DESC"
      ).all();
      return new Response(JSON.stringify(results), { status: 200 });
    }

    if (method === 'POST') {
      const bot = await request.json();
      const botId = 'bot_' + Date.now();

      await env.DB.prepare(
        `INSERT INTO bots (id, name, avatar, category, description, prompt, greeting, author_id, author_name, is_public) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        botId, bot.name, bot.avatar || '🤖', bot.category || 'other',
        bot.description || '', bot.prompt, bot.greeting,
        bot.author_id, bot.author_name, bot.is_public ? 1 : 0
      ).run();

      return new Response(JSON.stringify({ success: true, id: botId }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
