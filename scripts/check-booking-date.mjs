#!/usr/bin/env node

import assert from 'node:assert/strict';
import validateBookingDate from '../netlify/edge-functions/validate-booking-date.js';

const warsawFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Warsaw',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function warsawToday() {
  const parts = Object.fromEntries(warsawFormatter.formatToParts(new Date()).map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function shiftCalendarDay(today, days) {
  // UTC is only a calendar-arithmetic container: no local timezone or 24-hour DST assumption.
  const date = new Date(`${today}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function bookingBody(checkin, multipart = false) {
  const fields = multipart ? new FormData() : new URLSearchParams();
  fields.set('form-name', 'booking');
  if (checkin !== undefined) fields.set('checkin', checkin);
  return fields;
}

async function runCases(today) {
  const yesterday = shiftCalendarDay(today, -1);
  const tomorrow = shiftCalendarDay(today, 1);
  const future = shiftCalendarDay(today, 30);
  const impossible = `${Number(today.slice(0, 4)) + 1}-02-30`;
  const cases = [
    { name: 'future booking arrival', body: bookingBody(future) },
    { name: 'today in Warsaw', body: bookingBody(today) },
    { name: 'tomorrow in Warsaw', body: bookingBody(tomorrow) },
    { name: 'yesterday in Warsaw', body: bookingBody(yesterday), rejected: true },
    { name: 'malformed date format', body: bookingBody(`${future}T00:00:00Z`), rejected: true },
    { name: 'impossible date in a future year', body: bookingBody(impossible), rejected: true },
    { name: 'missing checkin', body: bookingBody(), rejected: true },
    { name: 'unrelated form with past arrival', body: new URLSearchParams({ 'form-name': 'contact', checkin: yesterday }) },
    {
      name: 'JSON booking request with past arrival',
      body: JSON.stringify({ 'form-name': 'booking', checkin: yesterday }),
      headers: { 'content-type': 'application/json' },
    },
    { name: 'multipart future arrival', body: bookingBody(future, true) },
    { name: 'multipart past arrival', body: bookingBody(yesterday, true), rejected: true },
  ];

  for (const { name, body, headers, rejected } of cases) {
    // Request sets form content types (including multipart boundaries); nothing is sent.
    const request = new Request('https://vista.example/contact.html', { method: 'POST', body, headers });
    const result = await validateBookingDate(request);
    if (rejected) {
      assert.ok(result instanceof Response, `${name}: expected a Response with HTTP 422`);
      assert.equal(result.status, 422, `${name}: expected HTTP 422`);
    } else {
      assert.equal(result, undefined, `${name}: expected undefined (pass-through)`);
    }
  }
  return cases.length;
}

async function main() {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const today = warsawToday();
    let failure;
    let count;
    try {
      count = await runCases(today);
    } catch (error) {
      failure = error;
    }
    // Recheck even after success: a midnight crossover makes this run inconclusive.
    if (warsawToday() !== today) {
      console.warn('Warsaw calendar date changed during the check; retrying with fresh dates.');
      continue;
    }
    if (failure) throw failure;
    console.log(`Booking-date check passed (${count} scenarios; Europe/Warsaw today: ${today}).`);
    return;
  }
  throw new Error('Warsaw calendar date changed during both attempts; timing issue, rerun the check.');
}

await main();
