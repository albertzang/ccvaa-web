import type { Metadata } from "next";
import { AdminPage } from "@/components/admin/AdminPage";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Admin",
  description: `Private admin console for ${siteConfig.name}.`,
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRoutePage() {
  return <AdminPage />;
}
