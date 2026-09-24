function currentWarsawDate() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = (type) => parts.find((part) => part.type === type).value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function validCalendarDate(value) {
  if (typeof value !== "string") return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year === 0) return false;
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export default async function validateBookingDate(request) {
  const contentType = request.headers.get("content-type") || "";
  if (!/^(application\/x-www-form-urlencoded|multipart\/form-data)\b/i.test(contentType)) return;

  let fields;
  try {
    fields = await request.clone().formData();
  } catch {
    return new Response("Nieprawidłowe dane formularza.", { status: 400 });
  }

  const formNames = fields.getAll("form-name");
  if (!formNames.includes("booking")) return;

  const arrivals = fields.getAll("checkin");
  if (formNames.length !== 1 || arrivals.length !== 1 || !validCalendarDate(arrivals[0]) || arrivals[0] < currentWarsawDate()) {
    return new Response("Wybierz poprawną datę przyjazdu: dziś lub później.", {
      status: 422,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
}

export const config = { path: "/*", method: "POST" };
