// /api/pay.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { customer, items, total } = req.body;

    // 1. ბაზაში სატესტო შეკვეთის ჩაწერა
    const { data: order, error } = await supabase
      .from('orders')
      .insert([
        {
          customer_name: `${customer.firstName} ${customer.lastName}`,
          phone: customer.phone,
          address: `${customer.address}, ${customer.city}`,
          items: items,
          total_amount: total,
          status: 'TEST_PAID' // სატესტო სტატუსი
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // 2. WhatsApp შეტყობინების სიმულაცია/გაგზავნა
    await sendWhatsAppNotification(order);

    // 3. წარმატებული პასუხი
    return res.status(200).json({ 
      success: true, 
      message: 'Test payment successful!',
      orderId: order.id 
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
}