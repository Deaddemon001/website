export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    return res.status(400).json({ error: 'DISCORD_WEBHOOK_URL environment variable is not configured' });
  }

  const { name, phone, area, service, message } = req.body || {};

  const areaMap = {
    mettur: 'Mettur Dam',
    mecheri: 'Mecheri',
    jalakandapuram: 'Jalakandapuram',
    muniyampatti: 'Muniyampatti',
    other: 'Other'
  };

  const serviceMap = {
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
          { name: '👤 Full Name', value: name || 'N/A', inline: true },
          { name: '📞 Phone Number', value: phone ? `[${phone}](tel:${phone})` : 'N/A', inline: true },
          { name: '📍 Service Area', value: formattedArea, inline: true },
          { name: '🛠️ Service Interested', value: formattedService, inline: true },
          { name: '💬 Message / Requirement', value: message || '*(No message provided)*', inline: false }
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
}
