/**
 * Telegram Notification Service
 * Trimite notificări către diferite canale Telegram
 */

// Tipuri de notificări
export const NOTIFICATION_TYPES = {
  MESSAGE: 'message',      // Mesaje noi de la utilizatori
  ORDER: 'order',          // Comenzi noi
  PAYMENT: 'payment'       // Plăți PayPal confirmate
};

/**
 * Obține configurația bot-ului în funcție de tipul notificării
 */
function getBotConfig(type) {
  switch (type) {
    case NOTIFICATION_TYPES.MESSAGE:
      return {
        token: process.env.TELEGRAM_BOT_MESSAGES_TOKEN,
        chatId: process.env.TELEGRAM_CHAT_MESSAGES_ID
      };
    case NOTIFICATION_TYPES.ORDER:
      return {
        token: process.env.TELEGRAM_BOT_ORDERS_TOKEN,
        chatId: process.env.TELEGRAM_CHAT_ORDERS_ID
      };
    case NOTIFICATION_TYPES.PAYMENT:
      return {
        token: process.env.TELEGRAM_BOT_PAYMENTS_TOKEN,
        chatId: process.env.TELEGRAM_CHAT_PAYMENTS_ID
      };
    default:
      return null;
  }
}

/**
 * Trimite notificare pe Telegram
 * @param {string} type - Tipul notificării (message, order, payment)
 * @param {string} message - Mesajul de trimis
 * @returns {Promise<boolean>} - true dacă a fost trimis cu succes
 */
export async function sendTelegramNotification(type, message) {
  try {
    const config = getBotConfig(type);
    
    if (!config || !config.token || !config.chatId) {
      console.warn(`Telegram bot not configured for type: ${type}`);
      return false;
    }

    const url = `https://api.telegram.org/bot${config.token}/sendMessage`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    const data = await response.json();
    
    if (!data.ok) {
      console.error(`Telegram error (${type}):`, data.description);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Telegram notification error (${type}):`, error);
    return false;
  }
}

/**
 * Notificare pentru mesaj nou de la utilizator
 */
export async function notifyNewMessage(user, subject, messageContent) {
  const message = `
📩 <b>MESAJ NOU</b>

👤 <b>De la:</b> ${user.name || 'Anonim'}
📧 <b>Email:</b> ${user.email}
📋 <b>Subiect:</b> ${subject}

💬 <b>Mesaj:</b>
${messageContent.substring(0, 500)}${messageContent.length > 500 ? '...' : ''}

🔗 <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/messages">Vezi în admin</a>
`;

  return sendTelegramNotification(NOTIFICATION_TYPES.MESSAGE, message);
}

/**
 * Notificare pentru comandă nouă
 */
export async function notifyNewOrder(order, user) {
  const itemsList = order.items
    .map(item => `  • ${item.productName} x${item.quantity} ${item.unit.replace('MDL/', '')} - ${(item.price * item.quantity).toFixed(2)} MDL`)
    .join('\n');

  const message = `
🛒 <b>COMANDĂ NOUĂ</b> #${order.id.slice(-8).toUpperCase()}

👤 <b>Client:</b> ${order.fullName}
📞 <b>Telefon:</b> ${order.phone}
📍 <b>Adresa:</b> ${order.address}, ${order.city}
💳 <b>Plată:</b> ${order.paymentMethod === 'cash' ? '💵 Cash la livrare' : order.paymentMethod === 'paypal' ? '💳 PayPal' : order.paymentMethod}

📦 <b>Produse:</b>
${itemsList}

💰 <b>Subtotal:</b> ${order.subtotal?.toFixed(2) || '0.00'} MDL
🚚 <b>Livrare:</b> ${order.shippingCost > 0 ? order.shippingCost.toFixed(2) + ' MDL' : 'GRATIS'}
💵 <b>TOTAL:</b> ${order.total.toFixed(2)} MDL

${order.notes ? `📝 <b>Note:</b> ${order.notes}\n` : ''}
🔗 <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders">Vezi în admin</a>
`;

  return sendTelegramNotification(NOTIFICATION_TYPES.ORDER, message);
}

/**
 * Notificare pentru plată PayPal confirmată
 */
export async function notifyPayPalPayment(paymentData, orderInfo) {
  const payerName = paymentData.payer?.name 
    ? `${paymentData.payer.name.given_name} ${paymentData.payer.name.surname}`
    : 'N/A';
  
  const payerEmail = paymentData.payer?.email_address || 'N/A';
  
  const amount = paymentData.purchase_units?.[0]?.payments?.captures?.[0]?.amount;
  const amountValue = amount ? `${amount.value} ${amount.currency_code}` : 'N/A';

  const message = `
💳 <b>PLATĂ PAYPAL CONFIRMATĂ</b>

🆔 <b>PayPal Order ID:</b> ${paymentData.id}
✅ <b>Status:</b> ${paymentData.status}

👤 <b>Plătitor:</b> ${payerName}
📧 <b>Email PayPal:</b> ${payerEmail}
💰 <b>Sumă:</b> ${amountValue}

${orderInfo ? `📦 <b>Comandă:</b> #${orderInfo.orderId?.slice(-8).toUpperCase() || 'N/A'}` : ''}

🔗 <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders">Vezi în admin</a>
`;

  return sendTelegramNotification(NOTIFICATION_TYPES.PAYMENT, message);
}
