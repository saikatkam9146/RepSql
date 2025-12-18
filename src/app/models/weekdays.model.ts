/**
 * Enumeration for weekdays
 * Used for weekly scheduling where Sunday=1, Saturday=7
 */
export enum WeekdayEnum {
  Sunday = 1,
  Monday = 2,
  Tuesday = 3,
  Wednesday = 4,
  Thursday = 5,
  Friday = 6,
  Saturday = 7
}

/**
 * Map for displaying weekday names
 */
export const WeekdayNames: { [key in WeekdayEnum]: string } = {
  [WeekdayEnum.Sunday]: 'Sunday',
  [WeekdayEnum.Monday]: 'Monday',
  [WeekdayEnum.Tuesday]: 'Tuesday',
  [WeekdayEnum.Wednesday]: 'Wednesday',
  [WeekdayEnum.Thursday]: 'Thursday',
  [WeekdayEnum.Friday]: 'Friday',
  [WeekdayEnum.Saturday]: 'Saturday'
};

/**
 * Array of weekday options for dropdowns
 */
export const WeekdayOptions = [
  { id: WeekdayEnum.Sunday, name: 'Sunday' },
  { id: WeekdayEnum.Monday, name: 'Monday' },
  { id: WeekdayEnum.Tuesday, name: 'Tuesday' },
  { id: WeekdayEnum.Wednesday, name: 'Wednesday' },
  { id: WeekdayEnum.Thursday, name: 'Thursday' },
  { id: WeekdayEnum.Friday, name: 'Friday' },
  { id: WeekdayEnum.Saturday, name: 'Saturday' }
];
