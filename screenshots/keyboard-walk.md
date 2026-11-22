# Keyboard Walk — MTS Portfolio Website (DEMO rebuild, Queue #1)
Date: 2026-11-21 · Engine: Playwright + Chrome headless shell, file:// preview, desktop 1280×900.
Method: sequential Tab presses from page top; the focused element and its computed focus indicator
(:focus-visible lime outline, or the form-field focus ring) are recorded at each stop.

## Contact (contact.html)

| # | Focused element | Visible focus style |
|---|---|---|
| 1 | a.skip-link — "Skip to content" | YES — outline 2px solid rgb(164, 214, 94) |
| 2 | a.wordmark — "MTS®
      Multi-TalentedServices" | YES — outline 2px solid rgb(164, 214, 94) |
| 3 | a — "Home" | YES — outline 2px solid rgb(164, 214, 94) |
| 4 | a — "Work" | YES — outline 2px solid rgb(164, 214, 94) |
| 5 | a — "Services" | YES — outline 2px solid rgb(164, 214, 94) |
| 6 | a — "About" | YES — outline 2px solid rgb(164, 214, 94) |
| 7 | a — "Contact" | YES — outline 2px solid rgb(164, 214, 94) |
| 8 | a.btn.btn-lime.header-cta — "Start a project" | YES — outline 2px solid rgb(164, 214, 94) |
| 9 | a.btn.btn-lime — "WhatsApp — +92 345 6481855" | YES — outline 2px solid rgb(164, 214, 94) |
| 10 | a.btn.btn-ghost — "Email us" | YES — outline 2px solid rgb(164, 214, 94) |
| 11 | input#c-name — "" | YES — box-shadow ring |
| 12 | input#c-contact — "" | YES — box-shadow ring |
| 13 | select#c-service — "Choose a service…
              Website De" | YES — box-shadow ring |
| 14 | input#c-message — "" | YES — box-shadow ring |
| 15 | button.btn.btn-lime.btn-block — "Send my project brief" | YES — outline 2px solid rgb(164, 214, 94) |
| 16 | a — "Home" | YES — outline 2px solid rgb(164, 214, 94) |

## Home (index.html)

| # | Focused element | Visible focus style |
|---|---|---|
| 1 | a.skip-link — "Skip to content" | YES — outline 2px solid rgb(164, 214, 94) |
| 2 | a.wordmark — "MTS®
      Multi-TalentedServices" | YES — outline 2px solid rgb(164, 214, 94) |
| 3 | a — "Home" | YES — outline 2px solid rgb(164, 214, 94) |
| 4 | a — "Work" | YES — outline 2px solid rgb(164, 214, 94) |
| 5 | a — "Services" | YES — outline 2px solid rgb(164, 214, 94) |
| 6 | a — "About" | YES — outline 2px solid rgb(164, 214, 94) |
| 7 | a — "Contact" | YES — outline 2px solid rgb(164, 214, 94) |
| 8 | a.btn.btn-lime.header-cta — "Start a project" | YES — outline 2px solid rgb(164, 214, 94) |

Result: every interactive stop received keyboard focus in DOM order (skip link → header nav →
page CTAs → form fields in order → submit → footer links → demo-log controls). No focus traps found;
the mobile menu additionally closes on Escape (verified in the flow run).
