import type { BusinessHoursDayKey, StoreBusinessHours } from "@/types/api/store";
import type { Locale } from "@/i18n/types";

const DAY_KEYS: BusinessHoursDayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
];

export function createDefaultBusinessHours(): StoreBusinessHours {
  return {
    monday: { enabled: false, start_time: "", end_time: "" },
    tuesday: { enabled: false, start_time: "", end_time: "" },
    wednesday: { enabled: false, start_time: "", end_time: "" },
    thursday: { enabled: false, start_time: "", end_time: "" },
    friday: { enabled: false, start_time: "", end_time: "" },
    saturday: { enabled: false, start_time: "", end_time: "" },
    sunday: { enabled: false, start_time: "", end_time: "" }
  };
}

export function normalizeBusinessHours(value?: StoreBusinessHours | null): StoreBusinessHours {
  const base = createDefaultBusinessHours();
  if (!value) return base;
  for (const key of DAY_KEYS) {
    const item = value[key];
    if (!item) continue;
    base[key] = {
      enabled: Boolean(item.enabled),
      start_time: item.start_time ?? "",
      end_time: item.end_time ?? ""
    };
  }
  return base;
}

export function getTodayKey(): BusinessHoursDayKey {
  const weekday = new Date().getDay();
  return DAY_KEYS[(weekday + 6) % 7];
}

function shortDayLabel(day: BusinessHoursDayKey, locale: Locale): string {
  const labels: Record<Locale, Record<BusinessHoursDayKey, string>> = {
    "pt-br": {
      monday: "Seg",
      tuesday: "Ter",
      wednesday: "Qua",
      thursday: "Qui",
      friday: "Sex",
      saturday: "Sáb",
      sunday: "Dom"
    },
    en: {
      monday: "Mon",
      tuesday: "Tue",
      wednesday: "Wed",
      thursday: "Thu",
      friday: "Fri",
      saturday: "Sat",
      sunday: "Sun"
    },
    es: {
      monday: "Lun",
      tuesday: "Mar",
      wednesday: "Mié",
      thursday: "Jue",
      friday: "Vie",
      saturday: "Sáb",
      sunday: "Dom"
    }
  };
  return labels[locale][day];
}

function formatTime(value?: string | null): string {
  if (!value) return "";
  const [h = "", m = ""] = value.split(":");
  if (!h) return "";
  if (!m || m === "00") return `${h}h`;
  return `${h}h${m}`;
}

export function buildBusinessHoursSummary(hours: StoreBusinessHours, locale: Locale): string {
  const normalized = normalizeBusinessHours(hours);
  const activeDays = DAY_KEYS.filter((key) => normalized[key].enabled);
  if (activeDays.length === 0) return "";

  const first = activeDays[0];
  const dayInfo = normalized[first];
  if (!dayInfo.start_time || !dayInfo.end_time) return "";

  const areSequential = activeDays.every((day, index) => DAY_KEYS.indexOf(day) === DAY_KEYS.indexOf(first) + index);
  const sameHours = activeDays.every((day) => {
    const item = normalized[day];
    return item.start_time === dayInfo.start_time && item.end_time === dayInfo.end_time;
  });

  if (areSequential && sameHours) {
    const firstLabel = shortDayLabel(first, locale);
    const lastLabel = shortDayLabel(activeDays[activeDays.length - 1], locale);
    return `${firstLabel}${activeDays.length > 1 ? ` a ${lastLabel}` : ""} - ${formatTime(dayInfo.start_time)} a ${formatTime(dayInfo.end_time)}`;
  }

  const firstLabel = shortDayLabel(first, locale);
  return `${firstLabel} - ${formatTime(dayInfo.start_time)} a ${formatTime(dayInfo.end_time)}`;
}

