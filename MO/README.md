# Mobile App (MO)

## Requirement Coverage

- [x] Apply standardized mobile UI template
- [x] API integration for all BE route groups (8 resources, 35+ endpoints)
- [x] Complete 3 core app flows
- [x] Push notification integration (local push + backend polling)

## Core Flows Implemented

1. Dashboard views
	- File: `lib/screens/dashboard_screen.dart`
	- Shows realtime metrics from backend resources.

2. Booking/Create main entity flow
	- File: `lib/screens/create_question_screen.dart`
	- Creates `Question` via API.

3. Management flow: List / Detail / Delete
	- Files:
	  - `lib/screens/question_management_screen.dart`
	  - `lib/screens/question_detail_screen.dart`
	- Supports list, detail, resolve, answer, and delete actions.

## API Coverage (All BE Route Groups)

1. Auth (10 endpoints)
	- `/auth/register`, `/auth/login`, `/auth/admin-lecturer-login`
	- `/auth/logout`, `/auth/refresh`, `/auth/heartbeat`
	- `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-otp`, `/auth/resend-otp`

2. Users (7 endpoints)
	- `/users`, `/users/me`, `/users/:id`
	- `POST /users`, `PUT /users/:id`, `PATCH /users/:id/role`, `DELETE /users/:id`

3. Semesters (6 endpoints)
	- `/semesters`, `/semesters/active`, `/semesters/:id`
	- `POST /semesters`, `PUT /semesters/:id`, `DELETE /semesters/:id`

4. Classes (5 endpoints)
	- `/classes`, `/classes/:id`
	- `POST /classes`, `PUT /classes/:id`, `DELETE /classes/:id`

5. Topics (7 endpoints)
	- `/topics`, `/topics/:id`
	- `POST /topics`, `PUT /topics/:id`, `DELETE /topics/:id`
	- `PUT /topics/:id/approve`, `PUT /topics/:id/reject`

6. Groups (8 endpoints)
	- `/groups`, `/groups/:id`, `/groups/:id/members`
	- `POST /groups`, `PUT /groups/:id`, `DELETE /groups/:id`
	- `POST /groups/:id/members`, `DELETE /groups/:id/members/:memberId`

7. Questions (6 endpoints)
	- `/questions`, `/questions/:id`
	- `POST /questions`, `PUT /questions/:id/escalate`, `PUT /questions/:id/resolve`, `DELETE /questions/:id`

8. Answers (6 endpoints)
	- `/questions/:questionId/answers`
	- `POST /questions/:questionId/answers`
	- `PUT /answers/:id`, `PUT /answers/:id/toggle-visibility`, `DELETE /answers/:id`, `/answers/public`

## Push Notification

- Implemented in `lib/services/notification_service.dart`.
- Uses `flutter_local_notifications`.
- Polls backend questions every 30 seconds and triggers local push when new questions appear.

## Run

```bash
flutter pub get
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000/api
```

If running on real device, replace `10.0.2.2` with your machine LAN IP.
