# Backend Services Breakdown

## 1. Auth Service
Responsibilities:
- registration/login/logout
- session handling
- password reset
- social auth later

## 2. Profile Service
Responsibilities:
- language preference
- learning path
- transmission type
- theme preference
- exam-related metadata later

## 3. Progress Service
Responsibilities:
- lesson progress CRUD
- chapter completion summaries
- sync local progress to cloud later

## 4. Tracker Service
Responsibilities:
- driving lesson logbook CRUD
- category totals
- summaries by lesson type

## 5. Quiz Service
Responsibilities:
- record attempts
- fetch history
- weak-topic stats later

## 6. Premium Service
Responsibilities:
- premium entitlement state
- provider sync later (Stripe/RevenueCat)

## 7. Content Versioning Service (Later)
Responsibilities:
- content version metadata
- legal version acceptance later
- remote content toggles later

## Suggested implementation order
1. Profile Service
2. Progress Service
3. Tracker Service
4. Quiz Service
5. Premium Service
