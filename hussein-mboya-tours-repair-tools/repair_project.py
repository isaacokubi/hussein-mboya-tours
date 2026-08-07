#!/usr/bin/env python3
from __future__ import annotations
import argparse, shutil, time
from pathlib import Path

def backup(path, backups, root):
    if path.exists():
        dst = backups / path.relative_to(root)
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, dst)

def replace(path, old, new, backups, root):
    if not path.exists():
        print(f"SKIP {path.relative_to(root)} (missing)")
        return
    text = path.read_text()
    if old not in text:
        print(f"SKIP {path.relative_to(root)} (pattern not found)")
        return
    backup(path, backups, root)
    path.write_text(text.replace(old, new))
    print(f"PATCH {path.relative_to(root)}")

def write(path, content, backups, root):
    backup(path, backups, root)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.strip() + "\n")
    print(f"WRITE {path.relative_to(root)}")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=".")
    root = Path(ap.parse_args().root).resolve()
    backups = root / ".repair-backups" / time.strftime("%Y%m%d-%H%M%S")
    backups.mkdir(parents=True, exist_ok=True)

    fixes = [
        ("client/src/components/admin/dashboard/StatsGrid.jsx", 'from "./StatCard";', 'from "./Statcard";'),
        ("client/src/components/agent/AgentDashboard.jsx", 'from "../../components/common/DashboardCard";', 'from "./DashboardCard";'),
        ("client/src/components/layout/MainLayout.jsx", 'import ScrollToTop from "./ScrollToTop";', 'import ScrollToTop from "../common/ScrollToTop";'),
        ("client/src/components/layouts/AgentLayout.jsx", 'from "../components/agent/AgentSidebar";', 'from "../agent/AgentSidebar";'),
        ("client/src/components/layouts/AgentLayout.jsx", 'from "../components/agent/AgentHeader";', 'from "../agent/AgentHeader";'),
        ("client/src/components/tours/tourManager/BookingTable.jsx", 'from "../../api/bookingApi";', 'from "../../../api/bookingApi";'),
        ("client/src/components/tours/tourManager/Notifications.jsx", 'from "../../api/notificationApi";', 'from "../../../api/notificationApi";'),
        ("client/src/components/tours/tourManager/RevenueChart.jsx", 'from "../../api/analyticsApi";', 'from "../../../api/analyticsApi";'),
        ("client/src/hooks/useNotifications.js", 'from "../services/socket";', 'from "../socket/socket.js";'),
        ("client/src/pages/rbac/RolesPage.jsx", 'from "../../../api/admin/rolesApi";', 'from "../../admin/rolesApi.js";'),
        ("server/routes/crmRoutes.js", 'from "../controllers/crmController.js";', 'from "../controllers/crmControllers.js";'),
    ]
    for rel, old, new in fixes:
        replace(root / rel, old, new, backups, root)

    scroll = root / "client/src/components/common/ScrollToTop.jsx"
    if not scroll.exists():
        write(scroll, r'''
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}
''', backups, root)

    rate = root / "server/middleware/rateLimiter.js"
    if not rate.exists():
        write(rate, r'''
import rateLimit from "express-rate-limit";

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

export default rateLimiter;
''', backups, root)

    guide = root / "server/middleware/guideMiddleware.js"
    if not guide.exists():
        write(guide, r'''
import { roleMiddleware } from "./roleMiddleware.js";

const guideMiddleware = roleMiddleware("tour_guide", "guide");

export { guideMiddleware };
export default guideMiddleware;
''', backups, root)

    seed = root / "server/seeds/seedDestinations.js"
    if not seed.exists():
        write(seed, r'''
import Destination from "../models/Destination.js";

const destinations = [
  {
    name: "Maasai Mara",
    slug: "maasai-mara",
    country: "Kenya",
    location: "Narok County",
    description: "Experience the Great Migration and unforgettable safari adventures.",
    images: ["/destinations/maasai-mara.jpg"],
    attractions: ["Great Migration", "Big Five Wildlife", "Maasai Culture"],
    activities: ["Game Drives", "Photography", "Hot Air Balloon Safari"],
    featured: true,
  },
  {
    name: "Amboseli National Park",
    slug: "amboseli-national-park",
    country: "Kenya",
    location: "Kajiado County",
    description: "Discover elephant herds and views of Mount Kilimanjaro.",
    images: ["/destinations/amboseli.jpg"],
    attractions: ["Mount Kilimanjaro Views", "Elephant Herds"],
    activities: ["Safari Drives", "Bird Watching", "Nature Walks"],
    featured: true,
  },
  {
    name: "Diani Beach",
    slug: "diani-beach",
    country: "Kenya",
    location: "Kwale County",
    description: "Relax on white sandy beaches and enjoy coastal experiences.",
    images: ["/destinations/diani.jpg"],
    attractions: ["White Sandy Beaches", "Indian Ocean", "Marine Life"],
    activities: ["Swimming", "Snorkeling", "Diving"],
    featured: true,
  },
];

export default async function seedDestinations() {
  await Destination.deleteMany({});
  const created = await Destination.insertMany(destinations);
  console.log(`Seeded ${created.length} destinations`);
  return created;
}
''', backups, root)

    print(f"\nRepair complete. Backups are in: {backups}")
    print("\nNext:")
    print("  python audit_project.py --root .")
    print("  cd client && npm ci && npm run build && npm run lint")
    print("  cd ../server && npm ci && npm start")

if __name__ == "__main__":
    main()
