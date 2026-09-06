// Fixtures for test-weekly-window.py. The date helpers are sliced out of
// engagement-module.jsx AT RUN TIME, so these run against the shipped module.
//
// What is being protected: the weekly rhythm target is the feature chosen
// INSTEAD OF a daily streak, on the grounds that a streak punishes normal life
// and produces quit-on-break. A window that hands someone three days out of two
// reintroduces exactly that cliff, so "everyone gets seven" is the property.

let failures = 0;
const assert = (c, m) => { if (!c) { console.error("FAIL: " + m); failures++; } };
const eq = (a, b, m) => assert(JSON.stringify(a) === JSON.stringify(b),
  m + "  (got " + JSON.stringify(a) + ", wanted " + JSON.stringify(b) + ")");

// ————— 1. a window is seven days, wherever it starts —————
{
  for (const start of ["2026-09-06", "2026-09-09", "2026-12-29", "2026-02-25"]) {
    const w = windowDayKeys(start);
    assert(w.length === 7, `window from ${start} is 7 days`);
    assert(w[0] === start, `window from ${start} starts on its anchor`);
    assert(daysBetween(w[0], w[6]) === 6, `window from ${start} spans 6 gaps`);
    assert(new Set(w).size === 7, `window from ${start} has no repeated date`);
  }
}

// ————— 2. it crosses month, year and leap-day boundaries —————
{
  eq(windowDayKeys("2026-12-29"),
     ["2026-12-29","2026-12-30","2026-12-31","2027-01-01","2027-01-02","2027-01-03","2027-01-04"],
     "window crosses the year");
  eq(windowDayKeys("2028-02-26"),
     ["2028-02-26","2028-02-27","2028-02-28","2028-02-29","2028-03-01","2028-03-02","2028-03-03"],
     "window crosses a leap day");
}

// ————— 3. Wednesday-to-Tuesday, which is the whole request —————
{
  const w = windowDayKeys("2026-09-09");           // a Wednesday
  eq(w.map(weekdayLabel), ["水","木","金","土","日","月","火"],
     "starting Wednesday runs 水 through 火");
}

// ————— 4. 日 comes first when the window starts on a Sunday —————
// The old fixed list was 月火水木金土日, so 日 was always last. Labels now come
// from the dates themselves and cannot disagree with them.
{
  const w = windowDayKeys("2026-09-06");           // a Sunday
  eq(w.map(weekdayLabel), ["日","月","火","水","木","金","土"],
     "starting Sunday runs 日 through 土, as a Japanese calendar prints it");
}

// ————— 5. a window is live for exactly seven days —————
{
  assert(windowLive("2026-09-06", "2026-09-06"), "live on its first day");
  assert(windowLive("2026-09-06", "2026-09-12"), "live on its SEVENTH day");
  assert(!windowLive("2026-09-06", "2026-09-13"), "expired on the eighth day");
  assert(!windowLive("2026-09-06", "2026-09-05"), "not live before it starts");
  assert(!windowLive(null, "2026-09-06"), "no anchor is not a live window");
  assert(!windowLive(undefined, "2026-09-06"), "undefined anchor is not live");
}

// ————— 6. upgrading state that predates the anchor —————
// The learner had days on the board under the old fixed week. Anchoring to
// today would show them 0 of 3 and silently take days they had earned.
{
  eq(inferWeekStart(["2026-09-02","2026-09-04"], "2026-09-06"), "2026-09-02",
     "anchors to the earliest recent active day");
  eq(inferWeekStart([], "2026-09-06"), null, "no history, no anchor");
  eq(inferWeekStart(undefined, "2026-09-06"), null, "missing history is survivable");
  eq(inferWeekStart(["2026-08-01"], "2026-09-06"), null,
     "a day long past does not anchor a window around it");
  // exactly on the boundary: 6 days ago is still inside a 7-day window
  eq(inferWeekStart(["2026-08-31"], "2026-09-06"), "2026-08-31",
     "six days ago is still in range");
  eq(inferWeekStart(["2026-08-30"], "2026-09-06"), null,
     "seven days ago is out of range");
  eq(inferWeekStart(["2026-09-20","2026-09-03"], "2026-09-06"), "2026-09-03",
     "a future date is not treated as a recent one");
}

// ————— 7. no partial windows, which is the point —————
// Under the old calendar week, starting on a Saturday gave two days to find
// three. Whatever day you start, you now get seven.
{
  for (const start of ["2026-09-05","2026-09-06","2026-09-07","2026-09-08",
                       "2026-09-09","2026-09-10","2026-09-11"]) {
    const w = windowDayKeys(start);
    assert(windowLive(start, w[6]), `a window starting ${start} is still live on its last day`);
    assert(w.length === 7, `a window starting ${start} is never short`);
  }
}

if (failures) { console.error("\n" + failures + " ASSERTION(S) FAILED"); process.exit(1); }
console.log("ALL WEEKLY-WINDOW TESTS PASS");
