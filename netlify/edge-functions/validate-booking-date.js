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

  // Stay dates are optional as a pair: both omitted (absent or empty), or a valid arrival
  // today or later in Warsaw with a later departure. A single date or a repeated field is rejected.
  const arrivals = fields.getAll("checkin");
  const departures = fields.getAll("checkout");
  const arrival = arrivals.length === 1 ? arrivals[0] : "";
  const departure = departures.length === 1 ? departures[0] : "";
  const omitted = arrival === "" && departure === "";
  const validPair =
    validCalendarDate(arrival) &&
    validCalendarDate(departure) &&
    arrival >= currentWarsawDate() &&
    departure > arrival;
  if (formNames.length !== 1 || arrivals.length > 1 || departures.length > 1 || !(omitted || validPair)) {
    return new Response("Pozostaw obie daty pobytu puste albo podaj przyjazd od dziś i późniejszy wyjazd.", {
      status: 422,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
}

export const config = { path: "/*", method: "POST" };
