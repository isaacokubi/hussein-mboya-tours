# Deployment Test Checklist

1. `cd client && npm install && npm run lint && npm run build`
2. `cd ../server && npm install && npm start`
3. Login as admin and verify Dashboard, Notifications, Roles & Permissions, Settings and Analytics.
4. Login as agent; if pending, verify dashboard loads and shows pending approval; approve from Admin → Agents and retest agent operations.
5. Login as guide and driver; verify dashboard notifications.
6. Login as customer; verify mobile hamburger, notifications, booking and My Bookings.
7. Tour Manager → Create New Tour: upload multiple images and verify the first becomes the featured image.
8. Public Tours: verify each tour with uploaded images shows its own image; image-less legacy tours use varied fallback imagery.
9. Tour Manager → Calendar: verify a tour appears only once per day.
10. Customer checkout: initiate M-Pesa, verify STK prompt message, then verify redirect to My Bookings.
11. Complete an M-Pesa payment and confirm Admin Analytics recognizes the completed Payment record without relying on booking status.
