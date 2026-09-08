import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://yxcexveaqdwmqpmtqsxn.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4Y2V4dmVhcWR3bXFwbXRxc3huIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODQ1NTQ0OCwiZXhwIjoyMTA0MDMxNDQ4fQ.hqEL8xOgDzEGiODlASzaeOEKlo5lNwlNI3bnJTrU9n0";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { customer, items, total } = req.body;

    const { data: order, error } = await supabase
      .from('orders')
      .insert([
        {
          customer_name: `${customer.firstName} ${customer.lastName}`,
          phone: customer.phone,
          address: `${customer.address}, ${customer.city}`,
          items: items,
          total_amount: total,
          status: 'BOG_TEST_PAID'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ 
      success: true, 
      message: 'Bank of Georgia Test Payment Successful!',
      orderId: order.id 
    });

  } catch (err) {
    console.error("Payment API Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}