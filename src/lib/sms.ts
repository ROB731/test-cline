/**
 * Envoi de SMS.
 * Aucun fournisseur n'est impose : si SMS_WEBHOOK_URL est defini, on poste
 * { to, message } dessus ; sinon le message est ecrit dans les logs (mode dev).
 */
export function smsConfigured(): boolean {
  return Boolean(process.env.SMS_WEBHOOK_URL);
}

export async function sendSms(phone: string, message: string): Promise<void> {
  const url = process.env.SMS_WEBHOOK_URL;

  if (!url) {
    console.info(`[sms:dev] ${phone} -> ${message}`);
    return;
  }

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env.SMS_API_KEY ? { authorization: `Bearer ${process.env.SMS_API_KEY}` } : {}),
      },
      body: JSON.stringify({ to: phone, message }),
    });
  } catch (error) {
    console.error("Echec de l'envoi du SMS", error);
  }
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return digits;
  return `${digits.slice(0, 2)} ${"•".repeat(Math.max(0, digits.length - 4))} ${digits.slice(-2)}`;
}
