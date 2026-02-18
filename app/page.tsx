import { prisma } from '@/lib/prisma';
import { StayCard } from '@/components/stay-card';

export default async function HomePage() {
  const group = await prisma.group.findFirst({ include: { stays: { orderBy: { createdAt: 'desc' } } } });

  if (!group) {
    return (
      <main className="container">
        <section className="hero">
          <h1>Group Stay Planner</h1>
          <p>No group exists yet. Create one from the admin panel.</p>
          <a className="btn primary" href="/admin/login">
            Open admin panel
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="container">
      <section className="hero">
        <h1>{group.name}</h1>
        <p>{group.description}</p>
        <p className="small">
          Compare all stay options proposed in your WhatsApp group. Re-upload chat exports as
          discussions evolve to keep this list current.
        </p>
        <div className="actions">
          <a className="btn primary" href="/admin/login">
            Admin panel
          </a>
        </div>
      </section>
      <section className="grid">
        {group.stays.map((stay) => (
          <StayCard key={stay.id} stay={stay} />
        ))}
      </section>
    </main>
  );
}
