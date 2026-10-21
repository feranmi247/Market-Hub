export default async function handler(req, res) {
  // Enable CORS so your GitHub Pages site can talk to this API
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, amount } = req.body;

  if (!email || !amount) {
    return res.status(400).json({ error: 'Email and amount are required' });
  }

  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        amount: Math.round(amount * 100), // Paystack uses Kobo (multiply by 100)
      }),
    });

    const data = await response.json();

    if (!data.status) {
      return res.status(400).json({ error: data.message });
    }

    return res.status(200).json({ access_code: data.data.access_code });
  } catch (error) {
    console.error('Paystack Error:', error);
    return res.status(500).json({ error: 'Server error initializing transaction' });
  }
}
