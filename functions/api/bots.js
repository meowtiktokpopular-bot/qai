
export async function onRequestGet(context) {
  const { env } = context;
  try {

    const { results } = await env.DB.prepare(
      "SELECT * FROM bots WHERE is_public = 1 ORDER BY created_at DESC"
    ).all();

    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
