export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const { action, email, password } = await request.json();
    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Укажите логин и пароль" }), { status: 400 });
    }

    // Простейшее хэширование пароля на стороне Cloudflare
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (action === 'register') {
      const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      
      const { success } = await env.DB.prepare(
        "INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)"
      ).bind(userId, email.toLowerCase(), passwordHash).run();

      if (!success) {
        return new Response(JSON.stringify({ error: "Пользователь уже существует" }), { status: 400 });
      }

      return new Response(JSON.stringify({ user: { id: userId, email } }), { status: 200 });
    }

    if (action === 'login') {
      const user = await env.DB.prepare(
        "SELECT id, email FROM users WHERE email = ? AND password_hash = ?"
      ).bind(email.toLowerCase(), passwordHash).first();

      if (!user) {
        return new Response(JSON.stringify({ error: "Неверный логин или пароль" }), { status: 401 });
      }

      return new Response(JSON.stringify({ user }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: "Неизвестное действие" }), { status: 400 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
