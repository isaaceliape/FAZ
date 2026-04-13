# Therapy Tracking

**Cadence:** Weekly sessions

## Session Log

### 2026-03-06 (Today)
- Topic created in Telegram group "Ai stuff" (topic 85)
- Goals: reminders, progress tracking, accountability, venting space

---

## Goals & Homework

_Pending: Add goals from first logged session_

---

## Notes & Insights

_Pending: Add insights as they come up_

---

## Check-in Schedule

- **Session day:** Tuesdays
- **Time:** Usually 19:00-20:00 (7-8pm Dublin time)
- **Therapist:** Guilherme Gomes dos Santos
- **Reminder:** Tuesday afternoon (around 16:00-17:00) - 2-3 hours before session
- **Follow-up:** Mid-week check-in on goals/homework (Thursday/Friday)

## Reminder Preference

<i class="fa fa-check-circle"></i> Isaac requested: "Please remind me before the session"
- Send reminder on Tuesday afternoons before therapy
- Check calendar for exact time each week

## Post-Session Follow-up

<i class="fa fa-check-circle"></i> Isaac requested: "after the session finishes be proactive and ask me what is the focus for the next week based on the therapy session"
- Check in after session ends (Tuesday evening or Wednesday morning)
- Ask: "What's the focus for next week based on your session?"
- Log any goals, insights, or homework in this file

## Cron Jobs (Automated)

| Job | Schedule | Description |
|-----|----------|-------------|
| `therapy-schedule-sync` | Sundays at 10:00 | Checks calendar, updates reminder/followup times |
| `therapy-reminder` | Tuesdays at 16:00 | Pre-session reminder |
| `therapy-followup` | Wednesdays at 09:00 | Post-session check-in |

**Auto-sync:** Every Sunday at 10am, the system checks Isaac's Google Calendar for therapy sessions with Guilherme and automatically updates the reminder/followup cron jobs to match the exact times.
