# Ghost AI Solutions Analytics Events

This document defines the current event taxonomy used by Vercel Analytics.

## Attribution

- `utm_landing`
  - Trigger: first visit when URL includes any UTM parameter.
  - Payload:
    - `utm_source`
    - `utm_medium`
    - `utm_campaign`
    - `utm_content`
    - `utm_term`
    - `landing_page`
    - `referrer`

## Funnel Behavior

- `scroll_depth`
  - Trigger: first time user crosses 25, 50, 75, 100 percent page depth.
  - Payload:
    - `percent`

- `section_view`
  - Trigger: first time section with `data-track-section` enters viewport threshold.
  - Payload:
    - `section`

## Experimentation

- `experiment_exposure`
  - Trigger: hero A/B assignment on homepage.
  - Payload:
    - `experiment` = `hero_value_prop_v1`
    - `variant` = `control | challenger`

- `landing_variant_view`
  - Trigger: UTM landing with route-level assignment active.
  - Payload:
    - `variant` = `control | ai-native`
    - `utm_campaign`
    - `utm_source`

## CTA Events

All CTA events fired through `TrackCTA` include common payload fields:

- `href`
- `section`
- `placement`
- `label`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`
- `landing_page`
- `referrer`
- `hero_variant`
- `campaign_type` (encoded via placement/label variants)
- `page_path`

Current CTA event names:

- `book_call_click_header`
- `book_call_click_mobile`
- `sticky_book_call_mobile`
- `hero_book_strategy_call`
- `hero_open_demo`
- `roi_build_plan_click`
- `homepage_final_book_call`
- `homepage_final_case_studies`
- `homepage_final_contact`
- `landing_ai_native_book_call`
- `landing_ai_native_view_demo`

## Recommended Dashboard Views

1. `utm_campaign` -> CTA click-through by `event`.
2. `hero_variant` -> `hero_book_strategy_call` conversion rate.
3. `section_view` progression vs `scroll_depth` milestones.
4. `landing_page` comparison for call-booking events.
