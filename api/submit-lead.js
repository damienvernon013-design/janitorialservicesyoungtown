const CRM_URL = 'https://thequotemasters.com/crm_api/api.php?action=push_lead';

function splitName(fullName) {
  const parts = String(fullName || '').trim().split(/\s+/);
  if (parts.length === 0 || parts[0] === '') return { first_name: '', last_name: '' };
  if (parts.length === 1) return { first_name: parts[0], last_name: '' };
  return { first_name: parts[0], last_name: parts.slice(1).join(' ') };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'same-origin');

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  const token = process.env.CRM_API_TOKEN;
  if (!token) {
    res.status(500).json({ ok: false, error: 'Server misconfigured' });
    return;
  }

  const body = req.body || {};
  const { name, phone, email, zip, facility, sqft, notes, utm_source } = body;

  if (!phone || !String(phone).trim()) {
    res.status(400).json({ ok: false, error: 'Phone is required' });
    return;
  }

  const { first_name, last_name } = splitName(name);
  const combinedNotes = [
    facility ? `Facility type: ${facility}` : null,
    sqft ? `Approx sq ft: ${sqft}` : null,
    notes ? String(notes) : null,
  ].filter(Boolean).join(' | ');

  const payload = {
    zip: zip ? String(zip).trim() : '',
    customer: {
      company_name: '',
      first_name,
      last_name,
      position: '',
      phone: String(phone).trim(),
      email: email ? String(email).trim() : '',
      email2: '',
      address: '',
      service_address: '',
      notes: combinedNotes,
    },
    industry: 23,
    questions: [],
    appointments: [],
    number_of_quotes: '1',
    utm_source: utm_source ? String(utm_source).slice(0, 255) : '',
  };

  try {
    const crmResponse = await fetch(CRM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await crmResponse.text();

    if (!crmResponse.ok) {
      res.status(502).json({ ok: false, error: 'CRM rejected the request' });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(502).json({ ok: false, error: 'Unable to reach CRM' });
  }
};
