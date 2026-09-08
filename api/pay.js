export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const SUPABASE_URL = "https://yxcexveaqdwmqpmtqsxn.supabase.co";
  // Vercel-ის Environment Variable-იდან წამოიღებს ან პირდაპირ სტრინგიდან
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4Y2V4dmVhcWR3bXFwbXRxc3huIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODQ1NTQ0OCwiZXhwIjoyMTA0MDMxNDQ4fQ.hqEL8xOgDzEGiODlASzaeOEKlo5lNwlNI3bnJTrU9n0";

  try {
    const { customer, items, total } = req.body;

    const payload = [
      {
        customer_name: `${customer.firstName} ${customer.lastName}`,
        phone: customer.phone,
        address: `${customer.address}, ${customer.city}`,
        items: items,
        total_amount: total,
        status: 'BOG_TEST_PAID'
      }
    ];

    // პირდაპირი REST მოთხოვნა Supabase-ის ბაზაში
    const response = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || JSON.stringify(data));
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Bank of Georgia Test Payment Successful!',
      order: data[0]
    });

  } catch (err) {
    console.error("Payment API Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}