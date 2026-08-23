import {

LayoutDashboard,

Calendar,

Package,

Users,

UserRound,

FileText,

ClipboardList,

Map,

CreditCard,

Settings,

BarChart3,

Wallet,

Plane,

Car,

MessageSquare,

Bell,

Shield

}

from "lucide-react";





/*
|--------------------------------------------------------------------------
| DATABASE ICON MAPPER
|--------------------------------------------------------------------------
|
| Database stores icon names as strings.
|
| Example:
|
| {
|   label:"Bookings",
|   icon:"calendar"
| }
|
| Sidebar resolves it here.
|
|--------------------------------------------------------------------------
*/





export const iconMap = {


/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/

dashboard: LayoutDashboard,

Dashboard: LayoutDashboard,

layoutdashboard: LayoutDashboard,





/*
|--------------------------------------------------------------------------
| BOOKINGS
|--------------------------------------------------------------------------
*/

calendar: Calendar,

Calendar,

bookings: Calendar,

Bookings: Calendar,





/*
|--------------------------------------------------------------------------
| PACKAGES
|--------------------------------------------------------------------------
*/

package: Package,

Package,

packages: Package,

Packages: Package,






/*
|--------------------------------------------------------------------------
| USERS
|--------------------------------------------------------------------------
*/

users: Users,

Users,

customers: Users,

Customers: Users,

user: UserRound,

User: UserRound,

agent: UserRound,

Agent: UserRound,






/*
|--------------------------------------------------------------------------
| REPORTS
|--------------------------------------------------------------------------
*/

filetext: FileText,

FileText,

reports: FileText,

Reports: FileText,






/*
|--------------------------------------------------------------------------
| QUOTATIONS
|--------------------------------------------------------------------------
*/

clipboardlist: ClipboardList,

ClipboardList,

quotations: ClipboardList,

Quotations: ClipboardList,







/*
|--------------------------------------------------------------------------
| TOURS
|--------------------------------------------------------------------------
*/

map: Map,

Map,

tours: Map,

Tours: Map,






/*
|--------------------------------------------------------------------------
| PAYMENTS
|--------------------------------------------------------------------------
*/

creditcard: CreditCard,

CreditCard,

payments: CreditCard,

Payments: CreditCard,






/*
|--------------------------------------------------------------------------
| FINANCE
|--------------------------------------------------------------------------
*/

wallet: Wallet,

Wallet,

commission: Wallet,

Commission: Wallet,






/*
|--------------------------------------------------------------------------
| TRANSPORT
|--------------------------------------------------------------------------
*/

plane: Plane,

Plane,

flights: Plane,

Flights: Plane,

car: Car,

Car,

vehicles: Car,

Vehicles: Car,






/*
|--------------------------------------------------------------------------
| COMMUNICATION
|--------------------------------------------------------------------------
*/

messages: MessageSquare,

Messages: MessageSquare,

message: MessageSquare,

notifications: Bell,

Notifications: Bell,

bell: Bell,






/*
|--------------------------------------------------------------------------
| SETTINGS & SECURITY
|--------------------------------------------------------------------------
*/

settings: Settings,

Settings,

security: Shield,

Security: Shield,

permissions: Shield,

Permissions: Shield,

roles: Shield,

Roles: Shield,






/*
|--------------------------------------------------------------------------
| ANALYTICS
|--------------------------------------------------------------------------
*/

analytics: BarChart3,

Analytics: BarChart3,

barChart: BarChart3


};
