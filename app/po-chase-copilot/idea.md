# PO Chase Copilot (Vue + email/calendar automation)

## Problem / Pain to solve
- After winning, providers still lose revenue because schools think funding approval equals an order. Reps manually chase POs and track Form 486/invoice deadlines in spreadsheets. One missed date means lost dollars.

## Who it’s for
- Service provider sales directors and E-rate coordinators who need post-award rigor without living in spreadsheets.

## Data sources (E-rate required)
- USAC Form 471 funding commitments (FRNs, amounts, service start dates).
- USAC Form 486 filings to confirm service start.
- Invoice deadline + service delivery deadline rules (derived from funding year dates).

## External APIs to use
- Gmail/Outlook API (or SMTP service like SendGrid) to send templated “place your PO” nudges and status updates.
- Google Calendar or Microsoft Graph Calendar to auto-create deadline events/reminders for reps and customers.
- Optional: Docusign/HelloSign links in templates for quick signature capture.

## What the Vue app does
- Dashboard of awarded FRNs with status chips: “Need PO,” “486 not filed,” “Invoice deadline in X days.”
- Generates customer-facing email sequences (friendly → urgent) and tracks sends/opens if provider uses SendGrid.
- One-click “Add to Calendar” adds 486 and invoice deadlines to shared calendars and to a rep’s personal calendar.
- PO checklist per award: service start date, contract validity, invoice method (SPI/BEAR), and latest communication log.

## Key Vue screens / flow
1) Awards list: sortable by risk (days until invoice deadline, PO missing) with quick filters.
2) Award detail: FRN data, funding amount, applicant contacts, timeline, and pre-filled email templates with merge tags.
3) Cadence setup: pick email template, cadence timing, recipients (school + internal), and which calendar(s) to drop deadlines into.
4) Activity log: shows last send, replies (if webhooks available), and manual notes.

## Why this fits the 6–8h build
- Small UI footprint (list + detail), uses simple REST to fetch USAC data and send emails/calendar events. Cadence logic can be minimal (1–2 steps).

## Validation scenarios
- Award with no PO and invoice deadline soon: verify risk surfacing + email send.
- Award with 486 already filed: checklist updates automatically.
- Applicant contact missing: UI flags missing data gracefully.
- Calendar API failure: surface non-blocking warning while keeping data visible.

## Elevator pitch
“PO Chase Copilot turns post-award chaos into cash. It pulls your funded 471s, flags missing POs and deadlines, and auto-sends polite-but-firm reminders while dropping 486/invoice dates on everyone’s calendar. No more losing E-rate dollars after you’ve already won.” 
