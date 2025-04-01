interface Timezone {
  value: string;
  label: string;
  group: string;
  offset: number;
}

// Timezones are sorted by offset and grouped by region
export const timezones: Timezone[] = [
  // Pacific
  { value: 'Pacific/Midway', label: '(GMT-11:00) Midway Island', group: 'Pacific', offset: -11 },
  { value: 'Pacific/Honolulu', label: '(GMT-10:00) Hawaii', group: 'Pacific', offset: -10 },
  { value: 'Pacific/Marquesas', label: '(GMT-09:30) Marquesas Islands', group: 'Pacific', offset: -9.5 },
  { value: 'Pacific/Gambier', label: '(GMT-09:00) Gambier Islands', group: 'Pacific', offset: -9 },
  { value: 'Pacific/Pitcairn', label: '(GMT-08:00) Pitcairn Islands', group: 'Pacific', offset: -8 },
  { value: 'Pacific/Easter', label: '(GMT-06:00) Easter Island', group: 'Pacific', offset: -6 },
  { value: 'Pacific/Galapagos', label: '(GMT-06:00) Galapagos Islands', group: 'Pacific', offset: -6 },
  { value: 'Pacific/Auckland', label: '(GMT+12:00) Auckland', group: 'Pacific', offset: 12 },
  { value: 'Pacific/Fiji', label: '(GMT+12:00) Fiji', group: 'Pacific', offset: 12 },
  { value: 'Pacific/Chatham', label: '(GMT+12:45) Chatham Islands', group: 'Pacific', offset: 12.75 },
  { value: 'Pacific/Tongatapu', label: '(GMT+13:00) Nuku\'alofa', group: 'Pacific', offset: 13 },
  { value: 'Pacific/Kiritimati', label: '(GMT+14:00) Kiritimati', group: 'Pacific', offset: 14 },

  // Americas
  { value: 'America/Anchorage', label: '(GMT-09:00) Alaska', group: 'Americas', offset: -9 },
  { value: 'America/Los_Angeles', label: '(GMT-08:00) Pacific Time', group: 'Americas', offset: -8 },
  { value: 'America/Phoenix', label: '(GMT-07:00) Arizona', group: 'Americas', offset: -7 },
  { value: 'America/Denver', label: '(GMT-07:00) Mountain Time', group: 'Americas', offset: -7 },
  { value: 'America/Chicago', label: '(GMT-06:00) Central Time', group: 'Americas', offset: -6 },
  { value: 'America/New_York', label: '(GMT-05:00) Eastern Time', group: 'Americas', offset: -5 },
  { value: 'America/Halifax', label: '(GMT-04:00) Atlantic Time', group: 'Americas', offset: -4 },
  { value: 'America/St_Johns', label: '(GMT-03:30) Newfoundland', group: 'Americas', offset: -3.5 },
  { value: 'America/Sao_Paulo', label: '(GMT-03:00) São Paulo', group: 'Americas', offset: -3 },
  { value: 'America/Noronha', label: '(GMT-02:00) Fernando de Noronha', group: 'Americas', offset: -2 },

  // Europe
  { value: 'Europe/London', label: '(GMT+00:00) London', group: 'Europe', offset: 0 },
  { value: 'Europe/Berlin', label: '(GMT+01:00) Berlin', group: 'Europe', offset: 1 },
  { value: 'Europe/Paris', label: '(GMT+01:00) Paris', group: 'Europe', offset: 1 },
  { value: 'Europe/Rome', label: '(GMT+01:00) Rome', group: 'Europe', offset: 1 },
  { value: 'Europe/Madrid', label: '(GMT+01:00) Madrid', group: 'Europe', offset: 1 },
  { value: 'Europe/Athens', label: '(GMT+02:00) Athens', group: 'Europe', offset: 2 },
  { value: 'Europe/Istanbul', label: '(GMT+03:00) Istanbul', group: 'Europe', offset: 3 },
  { value: 'Europe/Moscow', label: '(GMT+03:00) Moscow', group: 'Europe', offset: 3 },

  // Africa
  { value: 'Africa/Casablanca', label: '(GMT+00:00) Casablanca', group: 'Africa', offset: 0 },
  { value: 'Africa/Lagos', label: '(GMT+01:00) Lagos', group: 'Africa', offset: 1 },
  { value: 'Africa/Cairo', label: '(GMT+02:00) Cairo', group: 'Africa', offset: 2 },
  { value: 'Africa/Nairobi', label: '(GMT+03:00) Nairobi', group: 'Africa', offset: 3 },

  // Asia
  { value: 'Asia/Dubai', label: '(GMT+04:00) Dubai', group: 'Asia', offset: 4 },
  { value: 'Asia/Kabul', label: '(GMT+04:30) Kabul', group: 'Asia', offset: 4.5 },
  { value: 'Asia/Karachi', label: '(GMT+05:00) Karachi', group: 'Asia', offset: 5 },
  { value: 'Asia/Kolkata', label: '(GMT+05:30) Kolkata', group: 'Asia', offset: 5.5 },
  { value: 'Asia/Kathmandu', label: '(GMT+05:45) Kathmandu', group: 'Asia', offset: 5.75 },
  { value: 'Asia/Dhaka', label: '(GMT+06:00) Dhaka', group: 'Asia', offset: 6 },
  { value: 'Asia/Yangon', label: '(GMT+06:30) Yangon', group: 'Asia', offset: 6.5 },
  { value: 'Asia/Bangkok', label: '(GMT+07:00) Bangkok', group: 'Asia', offset: 7 },
  { value: 'Asia/Singapore', label: '(GMT+08:00) Singapore', group: 'Asia', offset: 8 },
  { value: 'Asia/Tokyo', label: '(GMT+09:00) Tokyo', group: 'Asia', offset: 9 },
  { value: 'Asia/Seoul', label: '(GMT+09:00) Seoul', group: 'Asia', offset: 9 },

  // Australia
  { value: 'Australia/Perth', label: '(GMT+08:00) Perth', group: 'Australia', offset: 8 },
  { value: 'Australia/Darwin', label: '(GMT+09:30) Darwin', group: 'Australia', offset: 9.5 },
  { value: 'Australia/Brisbane', label: '(GMT+10:00) Brisbane', group: 'Australia', offset: 10 },
  { value: 'Australia/Adelaide', label: '(GMT+10:30) Adelaide', group: 'Australia', offset: 10.5 },
  { value: 'Australia/Sydney', label: '(GMT+11:00) Sydney', group: 'Australia', offset: 11 },
  { value: 'Australia/Lord_Howe', label: '(GMT+11:00) Lord Howe Island', group: 'Australia', offset: 11 },

  // UTC
  { value: 'UTC', label: '(GMT+00:00) UTC', group: 'UTC', offset: 0 },
];

// Group timezones by region
export const timezoneGroups = Array.from(
  new Set(timezones.map(tz => tz.group))
).sort();

// Get current user's timezone
export const getUserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {
    return 'UTC';
  }
};

// Find closest timezone by offset
export const findClosestTimezone = (offset: number): string => {
  const userOffset = offset / 60; // Convert minutes to hours
  return timezones.reduce((prev, curr) => {
    return Math.abs(curr.offset - userOffset) < Math.abs(prev.offset - userOffset)
      ? curr
      : prev;
  }).value;
};

// Get timezone options grouped for select component
export const getTimezoneOptions = () => {
  return timezoneGroups.map(group => ({
    group,
    items: timezones
      .filter(tz => tz.group === group)
      .sort((a, b) => a.offset - b.offset)
  }));
};