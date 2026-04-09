export default async function handler(req, res) {

  // CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://talks.alohub.vn');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const { name, phone } = req.body || {};

  // Validate
  if (!name || name.length < 3 || name.length > 20)
    return res.status(400).json({ error: 'Tên không hợp lệ (3–20 ký tự).' });

  if (!/^(0[3-9][0-9]{8}|84[3-9][0-9]{8})$/.test((phone || '').trim()))
    return res.status(400).json({ error: 'Số điện thoại không đúng định dạng.' });

  // Forward — token lấy từ Vercel Environment Variable, không lộ ra client
  const upstream = await fetch(
    'https://api.alohub.vn/api/flows/webhook/1731/tech-talk',
    {
      method: 'POST',
      headers: {
        'Content-Type':   'application/json',
        'accept':         '*/*',
        'X-access-token': process.env.ALOHUB_TOKEN
      },
      body: JSON.stringify({ name: name.trim(), phone: phone.trim() })
    }
  );

  const data = await upstream.text();
  res.status(upstream.ok ? 200 : upstream.status).send(data);
}
