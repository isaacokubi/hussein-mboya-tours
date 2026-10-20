// Import the icon components used by sidebar/navigation configuration.
import {
  LayoutDashboard, // Dashboard/home icon.
  Calendar, // Calendar and schedule icon.
  Users, // People, customers and staff icon.
  Map, // Tours and destinations icon.
  Car, // Transport and vehicle icon.
  Wallet, // Finance and payment icon.
  FileText, // Reports and documents icon.
  Settings, // Application settings icon.
  HelpCircle // Help/support icon.
} from "lucide-react";

// Map stable icon names to the imported React icon components.
const iconMap = {
  LayoutDashboard, // Resolve the LayoutDashboard key to its component.
  Calendar, // Resolve the Calendar key to its component.
  Users, // Resolve the Users key to its component.
  Map, // Resolve the Map key to its component.
  Car, // Resolve the Car key to its component.
  Wallet, // Resolve the Wallet key to its component.
  FileText, // Resolve the FileText key to its component.
  Settings, // Resolve the Settings key to its component.
  HelpCircle // Resolve the HelpCircle key to its component.
};

// Export the map so navigation configuration can look up icons by name.
export default iconMap;
