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
} from "lucide-react";



/*
|--------------------------------------------------------------------------
| DYNAMIC ICON MAP
|--------------------------------------------------------------------------
|
| Icons are stored in database as strings:
|
| Dashboard
| Calendar
| Package
| Users
|
| Sidebar converts them here.
|
|--------------------------------------------------------------------------
*/


export const iconMap = {


    LayoutDashboard,

    Dashboard: LayoutDashboard,


    Calendar,

    Bookings: Calendar,


    Package,

    Packages: Package,


    Users,

    Customers: Users,


    User: UserRound,

    Agent: UserRound,


    FileText,

    Reports: FileText,


    ClipboardList,

    Quotations: ClipboardList,


    Map,

    Tours: Map,


    CreditCard,

    Payments: CreditCard,


    Wallet,

    Commission: Wallet,


    Plane,

    Flights: Plane,


    Car,

    Vehicles: Car,


    MessageSquare,

    Messages: MessageSquare,


    Bell,

    Notifications: Bell,


    Settings,

    Shield

};