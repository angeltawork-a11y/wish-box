import "server-only";

export function isMailConfigured(): boolean {
  return (
    (process.env.RESEND_API_KEY?.trim() ?? "") !== "" &&
    (process.env.MAIL_FROM?.trim() ?? "") !== ""
  );
}

/** Sends the login code. Returns unconfigured when mail secrets are absent. */
export async function sendLoginCode(
  to: string,
  code: string,
): Promise<"sent" | "unconfigured"> {
  const key = process.env.RESEND_API_KEY?.trim() ?? "";
  const from = process.env.MAIL_FROM?.trim() ?? "";
  if (key === "" || from === "") return "unconfigured";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Код входа — волшебная коробка желаний",
      text: `Код для входа: ${code}\nОн действует 10 минут. Если вы не запрашивали код, проигнорируйте письмо.`,
    }),
  });

  if (!res.ok) {
    throw new Error("Не удалось отправить письмо");
  }
  return "sent";
}
