import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getAdminCookieName } from '@/lib/auth';
import { AdminDashboard } from '@/components/admin-dashboard';

export default async function AdminPage() {
  if (cookies().get(getAdminCookieName())?.value !== '1') {
    redirect('/admin/login');
  }

  let group = await prisma.group.findFirst({ include: { stays: { orderBy: { createdAt: 'desc' } } } });

  if (!group) {
    group = await prisma.group.create({
      data: {
        name: 'Weekend Stay Comparison',
        description:
          'AI-generated summary: This group is comparing shortlisted stays for comfort, distance, food, budget, and safety so everyone can quickly align on one great option.'
      },
      include: { stays: true }
    });
  }

  return (
    <main className="container">
      <section className="hero">
        <h1>Admin panel</h1>
        <p>Manage properties extracted from WhatsApp group chat exports.</p>
        <form action="/api/admin/logout" method="post">
          <button type="submit">Log out</button>
        </form>
      </section>

      <AdminDashboard
        group={{ id: group.id, name: group.name, description: group.description, stays: group.stays }}
      />
    </main>
  );
}
