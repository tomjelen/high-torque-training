// True when the workouts have a newer "Last updated" date than what the user
// had when they last downloaded the zip. First-time visitors (null) see no
// badge — the install panel itself is their call to action.
export function shouldShowUpdateBadge(
  downloadedDate: string | null,
  currentDate: string,
): boolean {
  return downloadedDate !== null && downloadedDate < currentDate
}
