const pad = (value: number) => value.toString().padStart(2, "0");

export const getLocalDateKey = (date = new Date()) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const parseDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const addDaysToDateKey = (dateKey: string, days: number) => {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + days);
  return getLocalDateKey(date);
};

export const getPreviousDateKey = (dateKey = getLocalDateKey()) =>
  addDaysToDateKey(dateKey, -1);

export const getDateKeyDiff = (fromDateKey: string, toDateKey: string) => {
  const from = parseDateKey(fromDateKey);
  const to = parseDateKey(toDateKey);
  const diff = to.getTime() - from.getTime();
  return Math.floor(diff / (24 * 60 * 60 * 1000));
};
