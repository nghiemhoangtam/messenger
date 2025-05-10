export enum TimeUnit {
  SECOND = 'second',
  MINUTE = 'minute',
  HOUR = 'hour',
  DATE = 'date',
  MONTH = 'month',
  YEAR = 'year',
}

export function plus(
  amount: number,
  unit: TimeUnit,
  baseDate: Date = new Date(),
): Date {
  const result = new Date(baseDate);

  switch (unit) {
    case TimeUnit.SECOND:
      result.setSeconds(result.getSeconds() + amount);
      break;
    case TimeUnit.MINUTE:
      result.setMinutes(result.getMinutes() + amount);
      break;
    case TimeUnit.HOUR:
      result.setHours(result.getHours() + amount);
      break;
    case TimeUnit.DATE:
      result.setDate(result.getDate() + amount);
      break;
    case TimeUnit.MONTH:
      result.setMonth(result.getMonth() + amount);
      break;
    case TimeUnit.YEAR:
      result.setFullYear(result.getFullYear() + amount);
      break;
  }

  return result;
}

export const plusSecond = (amount: number, baseDate?: Date) =>
  plus(amount, TimeUnit.SECOND, baseDate);
export const plusMinute = (amount: number, baseDate?: Date) =>
  plus(amount, TimeUnit.MINUTE, baseDate);
export const plusHour = (amount: number, baseDate?: Date) =>
  plus(amount, TimeUnit.HOUR, baseDate);
export const plusDate = (amount: number, baseDate?: Date) =>
  plus(amount, TimeUnit.DATE, baseDate);
export const plusMonth = (amount: number, baseDate?: Date) =>
  plus(amount, TimeUnit.MONTH, baseDate);
export const plusYear = (amount: number, baseDate?: Date) =>
  plus(amount, TimeUnit.YEAR, baseDate);
