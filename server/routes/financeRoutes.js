// routes/financeRoutes.js


import express from "express";



import {


getFinanceStats,


getTransactions,


getReports



}

from "../controllers/financeController.js";



import {


protect


}

from "../middleware/authMiddleware.js";



import {


roleMiddleware


}

from "../middleware/roleMiddleware.js";







const router = express.Router();








/*
|--------------------------------------------------------------------------
| FINANCE SECURITY
|--------------------------------------------------------------------------
|
| All finance routes require:
|
| 1. Logged in user
| 2. Admin role
|
*/

router.use(

protect

);



router.use(

roleMiddleware(

"admin"

)

);










/*
|--------------------------------------------------------------------------
| FINANCE DASHBOARD STATISTICS
|--------------------------------------------------------------------------
|
| GET /api/admin/finance/stats
|
| Returns:
| - Revenue
| - Completed payments
| - Pending payments
| - Failed payments
| - Paid bookings
| - Commission totals
|
*/

router.get(

"/stats",

getFinanceStats

);










/*
|--------------------------------------------------------------------------
| M-PESA / PAYMENT TRANSACTIONS
|--------------------------------------------------------------------------
|
| GET /api/admin/finance/transactions
|
*/

router.get(

"/transactions",

getTransactions

);










/*
|--------------------------------------------------------------------------
| FINANCE REPORTS
|--------------------------------------------------------------------------
|
| GET /api/admin/finance/reports
|
| Monthly revenue analytics
|
*/

router.get(

"/reports",

getReports

);








export default router;