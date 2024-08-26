/*

 MIT License

 Copyright (c) 2021 Looker Data Sciences, Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */

// eslint-disable-next-line import/no-duplicates
import { format, formatDistance } from 'date-fns';
// eslint-disable-next-line import/no-duplicates
import { enUS, ja } from 'date-fns/locale';
import { utcToZonedTime } from 'date-fns-tz';
import cloneDeep from 'lodash/cloneDeep';

/** Alias for Date in case AgendaTime needs to be someting else in the future */
export type AgendaTime = Date;

/** an agenda entry */
export interface IAgendaItem {
  /** Markdown description of agenda item */
  description: string;
  /** Start datetime of agenda item */
  start: AgendaTime;
  /** End of agenda item. If not specified, the next chronological event will be its end time */
  stop?: AgendaTime;
}

export type AgendaItems = Array<IAgendaItem>;

/**
 * Apply timezone to a date
 * @param date to zone
 * @param zone zone to apply
 */
export const zoneDate = (date: AgendaTime, zone: string) => {
  return utcToZonedTime(date, zone);
};

/**
 * Localization of date/time is not exhaustive. Currently, only Japanese and English are imported
 * @param locale anything but `ja_JP` defaults to `en`
 */
export const dateLocale = (locale: string) => (locale === 'ja_JP' ? ja : enUS);

/**
 * Format a date using locale and string template
 *
 * Template values are documented at https://date-fns.org/v2.25.0/docs/format
 *
 * @param value to format
 * @param locale to localize
 * @param template for formatting
 */
export const dateString = (
  value: AgendaTime,
  locale: string,
  template = 'PPpp'
) => {
  return format(value, template, { locale: dateLocale(locale) });
};

/**
 * Localized, zoned time
 * @param value to zone and localize
 * @param zone to use
 * @param locale to use
 * @param template override for dateString()
 */
export const zonedLocaleDate = (
  value: AgendaTime,
  zone: string,
  locale: string,
  template = 'PPpp'
) => {
  return dateString(zoneDate(value, zone), locale, template);
};

/**
 * Display the Month abbreviation and nth day
 * @param date to display
 * @param locale for display
 */
export const monthDay = (date: AgendaTime, locale: string) => {
  return dateString(date, locale, 'MMM do');
};

/**
 * String showing localized start and stop date
 *
 * If the start and stop are the same day, only one Mon Day is shown
 *
 * @param start time
 * @param stop time
 * @param locale for display
 */
export const gapDate = (
  start: AgendaTime,
  stop: AgendaTime,
  locale: string
) => {
  let result = monthDay(start, locale);
  if (start.getDate() !== stop.getDate()) {
    result += ` - ${dateString(stop, locale, 'do')}`;
  }
  return result;
};

/**
 * String showing localized start and stop time
 * @param start time
 * @param stop time
 * @param locale for display
 */
export const gapTime = (
  start: AgendaTime,
  stop: AgendaTime,
  locale: string
) => {
  const template = 'K:mm b';
  return `${dateString(start, locale, template)} - ${dateString(
    stop,
    locale,
    template
  )}`;
};

/**
 * the textual difference between two times
 * @param first time to compare
 * @param second time to compare
 * @param locale for displaying difference
 */
export const diff = (first: AgendaTime, second: AgendaTime, locale: string) => {
  return formatDistance(second, first, {
    addSuffix: true,
    locale: dateLocale(locale),
  });
};

/**
 * text describing the time difference for a start/stop time period compared to "now"
 * @param now diff comparison centerpoint
 * @param start time of item
 * @param stop time of item
 * @param locale for displaying diff
 */
export const gapDiff = (
  now: AgendaTime,
  start: AgendaTime,
  stop: AgendaTime,
  locale: string
) => {
  if (now < start) {
    // Prefixes not localized. TODO: fix
    return 'starts ' + diff(now, start, locale);
  } else if (now < stop) {
    return 'ends ' + diff(now, stop, locale);
  }
  return 'ended ' + diff(now, stop, locale);
};

/**
 * Sort chronologically, assign default stops
 * @param schedule to fill out
 */
export const calcAgenda = (schedule: AgendaItems) => {
  const agenda = cloneDeep(schedule).sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  );
  agenda.forEach((item, index) => {
    // Fill in any missing stop values with the next item's start value
    if (!item.stop) {
      if (index < agenda.length - 1) {
        item.stop = agenda[index + 1].start;
      }
    }
  });
  return agenda;
};

/** Era buckets */
export enum Era {
  present = 'present',
  future = 'future',
  past = 'past',
}

/** Era buckets for a schedule */
export interface IAgendaEras {
  past: AgendaItems;
  present: AgendaItems;
  future: AgendaItems;
}

/**
 * Base color for an era
 * @param era to colorize
 */
export const eraColor = (era: string) => {
  switch (era) {
    case Era.present:
      return 'calculation';
    case Era.future:
      return 'dimension';
    default:
      return 'neutral';
  }
};

/**
 * Default stops, set timezone, and put agenda items into era buckets
 * @param schedule to process
 * @param current time to use for bucketing
 */
export const agendaEras = (
  schedule: AgendaItems,
  current: Date = new Date()
): IAgendaEras => {
  const time = current.getTime();
  const agenda = calcAgenda(schedule);
  const result: IAgendaEras = {
    past: [],
    present: [],
    future: [],
  };
  agenda.forEach(item => {
    const start = item.start.getTime();
    const stop = item.stop!.getTime();
    if (time < start) {
      result.future.push(item);
    } else if (time < stop) {
      result.present.push(item);
    } else {
      result.past.push(item);
    }
  });
  return result;
};
