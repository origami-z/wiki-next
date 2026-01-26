Phase 5 implementation is complete! I've successfully added internationalization support to the event system components and pages.

## Changes Made

**Phase 5: Translations**

### Translation Files Updated:

1. **messages/en.json** - Added event system translations including:
   - Event status labels (active, upcoming, ended)
   - Event page titles and section headers
   - Countdown timer labels (days, hours, minutes, seconds)
   - Event stages and requirements/rewards labels
   - Timeline and recurring event labels

2. **messages/zh.json** - Added Chinese translations for all event UI strings

### Components Updated to Use Translations:

3. **src/components/features/Events/EventCard/index.tsx**
   - Added useTranslations hook
   - Translated status badges, recurring label, and countdown labels

4. **src/components/features/Events/EventCountdown/index.tsx**
   - Added useTranslations hook for countdown labels
   - Translated days, hours, minutes, seconds labels

5. **src/components/features/Events/EventStages/index.tsx**
   - Added useTranslations hook
   - Translated "Event Stages", "Requirements", and "Rewards" labels

6. **src/components/features/Events/EventTimeline/index.tsx**
   - Added useTranslations hook
   - Translated timeline heading, active/upcoming status, and event type labels

### Pages Updated to Use Translations:

7. **src/app/[locale]/games/[gameSlug]/events/page.tsx**
   - Added getTranslations from next-intl/server
   - Translated page title and all section headers
   - Translated empty state messages

8. **src/app/[locale]/games/[gameSlug]/events/[eventSlug]/page.tsx**
   - Added getTranslations from next-intl/server
   - Translated back link, status badge, date labels
   - Translated recurring event info and future dates section

## New Translation Keys Added

### English (en.json):
```json
{
  "events": {
    "title": "Game Events",
    "activeEvents": "Active Events",
    "upcomingEvents": "Upcoming Events",
    "pastEvents": "Past Events",
    "noActiveEvents": "No active events currently.",
    "noUpcomingEvents": "No upcoming events scheduled.",
    "upcomingTimeline": "Upcoming Timeline",
    "recurring": "Recurring",
    "endsIn": "Ends in:",
    "startsIn": "Starts in:",
    "endedOn": "Ended on {date}",
    "activeNow": "Active Now",
    "startsInDays": "Starts in {days} days",
    "recurringEvent": "Recurring Event",
    "limitedEvent": "Limited Event",
    "eventStages": "Event Stages",
    "requirements": "Requirements",
    "rewards": "Rewards",
    "backToEvents": "Back to Events",
    "starts": "Starts",
    "ends": "Ends",
    "repeatsEvery": "Repeats every {days} days",
    "futureDates": "Future Dates",
    "status": {
      "active": "Active",
      "upcoming": "Upcoming",
      "ended": "Ended"
    }
  },
  "countdown": {
    "days": "Days",
    "hours": "Hrs",
    "minutes": "Mins",
    "seconds": "Secs"
  }
}
```

### Chinese (zh.json):
```json
{
  "events": {
    "title": "游戏活动",
    "activeEvents": "进行中的活动",
    "upcomingEvents": "即将开始的活动",
    "pastEvents": "已结束的活动",
    ...
  },
  "countdown": {
    "days": "天",
    "hours": "时",
    "minutes": "分",
    "seconds": "秒"
  }
}
```

## Verification

- Build completed successfully with all pages generating correctly
- Both English and Chinese locales are properly supported
- All event pages and components now display translated content based on locale
