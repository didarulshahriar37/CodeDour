# Contest backend checklist

These items support the current contest frontend. They are notes only; no backend code has been changed.

## 1. Return ownership and registration data

Update both `GET /contests` and `GET /contests/:id` to return:

- `created_by` — the creator's `user_id`, in addition to `created_by_name`.
- `is_registered` — whether the signed-in user has a row in `contest_participants` for that contest.

The frontend currently uses display-name matching for **My Hosted Contests** and browser storage for **My Contest History**. These fields will make both features reliable across devices and avoid conflicts when two users have the same display name.

The list endpoint must use optional authentication: guests can still view published contests, while a signed-in user's identity is available to calculate `is_registered`.

## 2. Enforce unpublished-contest visibility

`GET /contests/:id` currently returns an unpublished contest to anyone who knows its ID or slug. Change it so that:

- Published contests are visible to everyone.
- Unpublished contests are visible only to their creator and admins.
- Unauthorized users receive a `404` or `403` response and do not receive the contest problems.

## 3. Add an admin contest-list endpoint

The current `GET /contests` query only returns `is_published = TRUE`. Add `GET /admin/contests`, protected by the existing admin middleware, to return all contests, including unpublished ones. This allows Admin Contest Management to correctly show **Published** and **Unpublished** contests.

## 4. Provide a leave-contest endpoint

The frontend calls `DELETE /contests/:id/join` when a user exits a contest, but that route is not present in `backend/src/routes/contest.routes.js`. Add a verified route and controller that deletes only the signed-in user's participant row for that contest.

## 5. Scope submissions to a contest

The green solved indicator should be based on accepted submissions for that contest's problems. Add a way to query submissions by `contest_id`, and ensure submitting a contest solution verifies that the user has entered the contest. This prevents an accepted normal-practice submission from appearing as a contest solve.

## 6. Keep contest status server-derived

Continue returning `upcoming`, `running`, and `ended` from start and end times. The frontend uses this for the public Upcoming section and My Contest History, where history should include only contests with `status = "ended"` and `is_registered = true`.
