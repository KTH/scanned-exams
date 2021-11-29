/**
 * Brief explanation about assignments in Canvas.
 *
 * All assignments in Canvas can have three date fields which are called:
 * `unlock_date`, `lock_date` and `due_at`.
 *
 * In general, those dates are defined as follow:
 * - range between `unlock_date` and `lock_date` represents the period of time
 *   where the assignment is "open" and can receive submissions.
 * - `due_at`: when someone sends a submission after this date, the submission
 *   is marked as "LATE"
 *
 * For safety reasons, we want to:
 * - be able to upload scanned exams to an assignment
 * - not allow students to upload things to the same assignment.
 *
 * The Canvas API for submissions, however, has the following rules:
 * - The assignment must be "open" to be able to upload scanned exams (current
 *   date must be between `unlock_date` and `lock_date`)
 * - If the assignment is "open", students can also upload things
 * - When using a token with teacher permissions, it is possible to write
 *   manually the "submission date", meaning that we can force the submission to
 *   not be marked as "LATE".
 *
 * Conclusions are:
 * - When uploading an exam, we "unlock" it for the shortest possible period of
 *   time. That lowers the risk of students uploading their submissions.
 * - Create the assignment with "due_at" date equal to the examination date.
 *   That ensures that students submissions are marked as "LATE" even in the
 *   strange case where they could upload something during the "unlock" period.
 *
 * This module contains all the properties to create an assignment, unlock it,
 * lock it, and send submissions correctly
 */

export function propertiesToCreateLockedAssignment(examDate) {
  return {
    submission_types: ["on_paper"],

    // When passing "00:00" to Canvas API, it is converted to "23:59"
    // In order to avoid this, we pass "00:01" instead
    due_at: `${examDate}T00:01:00`,
  };
}

export function propertiesToCreateSubmission(examDate) {
  return {
    // This ensures us that the things we upload are not considered "LATE"
    submitted_at: `${examDate}T00:00:00`,
  };
}

export function propertiesToUnlockAssignment() {
  // Ideally we unlock the assignment for few seconds. However, Canvas API
  // ignores seconds, so the minimum is 1 minute
  const ONE_MINUTE_LATER = new Date();
  ONE_MINUTE_LATER.setMinutes(ONE_MINUTE_LATER.getMinutes() + 1);

  return {
    submission_types: ["online_upload"],
    allowed_extensions: ["pdf"],
    lock_at: ONE_MINUTE_LATER.toISOString(),
  };
}

export function propertiesToLockAssignment() {
  return {
    submission_types: ["on_paper"],
  };
}
