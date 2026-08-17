module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    return res.status(400).json({ error: 'DISCORD_WEBHOOK_URL environment variable is not configured on Vercel' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }

  const { name, phone, area, service, message } = body || {};

  const areaMap = {
    mettur: 'Mettur Dam',
    mecheri: 'Mecheri',
    jalakandapuram: 'Jalakandapuram',
    muniyampatti: 'Muniyampatti',
    other: 'Other'
  };

  const serviceMap = {
    'data-entry': 'Data Entry & BPO Outsourcing',
    'image-editing': 'Image Editing & Retouching',
    networking: 'Network / ISP Support',
    cctv: 'CCTV Installation',
    fiber: 'Fiber Optic Splicing',
    software: 'Software / Website / App',
    internet: 'Internet Connection',
    hardware: 'Hardware Purchase',
    other: 'Other'
  };

  const formattedArea = areaMap[area] || area || 'Not specified';
  const formattedService = serviceMap[service] || service || 'Not specified';

  const discordPayload = {
    username: 'Smartgem Website Lead',
    embeds: [
      {
        title: '📩 New Customer Inquiry from Website!',
        color: 1994751, // #1e6fff
        fields: [
          { name: '👤 Full Name', value: String(name || 'N/A'), inline: true },
          { name: '📞 Phone Number', value: phone ? `[${phone}](tel:${phone})` : 'N/A', inline: true },
          { name: '📍 Service Area', value: String(formattedArea), inline: true },
          { name: '🛠️ Service Interested', value: String(formattedService), inline: true },
          { name: '💬 Message / Requirement', value: String(message || '*(No message provided)*'), inline: false }
        ],
        footer: { text: 'Smartgem Technologies Notification System' },
        timestamp: new Date().toISOString()
      }
    ]
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload)
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: 'Discord webhook error', details: errText });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
