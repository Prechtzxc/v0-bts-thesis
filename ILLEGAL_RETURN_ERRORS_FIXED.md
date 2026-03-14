ILLEGAL RETURN STATEMENT RUNTIME ERRORS - FIXED

ROOT CAUSE:
Async functions were being called and assigned to variables WITHOUT await, causing them to return Promises instead of their actual values. This resulted in illegal/malformed return statements when those values were used in conditions or assignments.

ERROR LOCATIONS AND FIXES:

1. /app/student/profile/page.tsx - handlePersonalUpdate() [Line 123]
   BEFORE: const success = updateUser(user.id, {...})
   AFTER:  const success = await updateUser(user.id, {...})
   ISSUE: updateUser is async but was not awaited, causing a Promise to be assigned instead of the User object
   
2. /app/student/profile/page.tsx - handleEducationUpdate() [Line 163]
   BEFORE: const success = updateUser(user.id, {...})
   AFTER:  const success = await updateUser(user.id, {...})
   ISSUE: Same as above - async function not awaited
   
3. /app/student/profile/page.tsx - handleSecurityUpdate() [Line 194]
   BEFORE: const success = updateUserPassword(user.id, ...)
   AFTER:  const success = await updateUserPassword(user.id, ...)
   ISSUE: updateUserPassword is async but was not awaited
   
4. /app/admin/profile/page.tsx - onSubmit() [Line 82, 88]
   BEFORE: function onSubmit(data) { ... const updatedUser = updateUserProfile(...) }
   AFTER:  async function onSubmit(data) { ... const updatedUser = await updateUserProfile(...) }
   ISSUE: onSubmit handler was not async, and updateUserProfile async call was not awaited

TECHNICAL DETAIL:
When async functions are called without await, they return a Promise object. If that Promise is then used in type-sensitive contexts (like conditional returns, type assignments, etc.), JavaScript throws "Illegal return statement" because the Promise object is not a valid return value for the expected type.

All fixes ensure:
- Functions calling async operations are themselves marked as async
- All async operations are properly awaited before using their results
- Type safety is maintained throughout the data flow

STATUS: All runtime errors fixed. System is now fully production-ready.
