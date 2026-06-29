import { Suspense } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import ListingsShell from "@/components/ListingsShell";
import PlotListSection from "@/components/PlotListSection";
import PlotListSkeleton from "@/components/PlotListSkeleton";
import { getSitePhone } from "@/lib/siteSettings";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }) {
  const [session, phone] = await Promise.all([
    getServerSession(authOptions),
    getSitePhone(),
  ]);
  const town    = searchParams?.town || "";
  const isAdmin = session?.user?.email === process.env.ADMIN_EMAIL;

  return (
    <ListingsShell>
      <Suspense key={town} fallback={<PlotListSkeleton />}>
        <PlotListSection town={town} phone={phone} isAdmin={isAdmin} />
      </Suspense>
    </ListingsShell>
  );
}
