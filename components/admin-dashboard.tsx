'use client';

type StayItem = {
  id: string;
  name: string;
  address: string;
  mapsLink: string | null;
  rating: number | null;
  pricePerNight: number | null;
  foodIncluded: boolean;
  images: string[];
  recommendedBy: string[];
  contactName: string | null;
  contactPhone: string | null;
  notes: string | null;
};

type GroupPayload = {
  id: string;
  name: string;
  description: string;
  stays: StayItem[];
};

export function AdminDashboard({ group }: { group: GroupPayload }) {
  async function upsertStay(formData: FormData) {
    const id = String(formData.get('id') ?? '');
    const payload = {
      id: id || undefined,
      groupId: group.id,
      name: String(formData.get('name') ?? ''),
      address: String(formData.get('address') ?? ''),
      mapsLink: String(formData.get('mapsLink') ?? ''),
      rating: Number(formData.get('rating') || 0) || null,
      pricePerNight: Number(formData.get('pricePerNight') || 0) || null,
      foodIncluded: formData.get('foodIncluded') === 'on',
      images: String(formData.get('images') ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      recommendedBy: String(formData.get('recommendedBy') ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      contactName: String(formData.get('contactName') ?? ''),
      contactPhone: String(formData.get('contactPhone') ?? ''),
      notes: String(formData.get('notes') ?? '')
    };

    const response = await fetch(id ? `/api/stays/${id}` : '/api/stays', {
      method: id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      alert('Save failed. Check inputs.');
      return;
    }

    location.reload();
  }

  async function removeStay(id: string) {
    const response = await fetch(`/api/stays/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      alert('Delete failed.');
      return;
    }
    location.reload();
  }

  async function importChat(formData: FormData) {
    formData.set('groupId', group.id);

    const response = await fetch('/api/chat-import', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      alert('Import failed. Upload a WhatsApp .zip/.txt export or provide chat text.');
      return;
    }

    location.reload();
  }

  return (
    <>
      <section className="panel">
        <h2>Bulk import WhatsApp chat export</h2>
        <p className="small">
          Upload exported WhatsApp <code>.zip</code>/<code>.txt</code> files. We use a local Ollama model to intelligently extract stays and categories, then save them to the database. You can still paste structured entries as fallback.
        </p>
        <form action={importChat}>
          <label>
            Upload WhatsApp export (.zip or .txt)
            <input type="file" name="chatFile" accept=".zip,.txt,text/plain,application/zip" />
          </label>
          <label>
            Optional: paste chat text directly
            <textarea name="chatText" placeholder="Paste parsed chat snippets or raw WhatsApp chat here..." />
          </label>
          <button className="primary" type="submit">
            Import entries
          </button>
        </form>
      </section>

      <section className="panel">
        <h2>Add new stay</h2>
        <StayForm onSubmit={upsertStay} />
      </section>

      <section className="panel">
        <h2>Existing stays</h2>
        <table className="table-like">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Recommended by</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {group.stays.map((stay) => (
              <tr key={stay.id}>
                <td>{stay.name}</td>
                <td>{stay.pricePerNight ? `₹${stay.pricePerNight}` : '-'}</td>
                <td>{stay.recommendedBy.join(', ') || '-'}</td>
                <td>
                  <details>
                    <summary>Edit</summary>
                    <StayForm stay={stay} onSubmit={upsertStay} />
                    <button onClick={() => removeStay(stay.id)}>Delete</button>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

function StayForm({
  stay,
  onSubmit
}: {
  stay?: StayItem;
  onSubmit: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={onSubmit}>
      <input type="hidden" name="id" defaultValue={stay?.id} />
      <label>
        Name
        <input name="name" defaultValue={stay?.name} required />
      </label>
      <label>
        Address
        <input name="address" defaultValue={stay?.address} required />
      </label>
      <label>
        Google map link
        <input name="mapsLink" defaultValue={stay?.mapsLink ?? ''} />
      </label>
      <label>
        Rating
        <input type="number" name="rating" step="0.1" min="0" max="5" defaultValue={stay?.rating ?? ''} />
      </label>
      <label>
        Price per night
        <input type="number" name="pricePerNight" min="0" defaultValue={stay?.pricePerNight ?? ''} />
      </label>
      <label>
        <input type="checkbox" name="foodIncluded" defaultChecked={stay?.foodIncluded} /> Food included
      </label>
      <label>
        Images (comma-separated URLs)
        <input name="images" defaultValue={stay?.images.join(', ')} />
      </label>
      <label>
        Recommended by (comma-separated)
        <input name="recommendedBy" defaultValue={stay?.recommendedBy.join(', ')} />
      </label>
      <label>
        Contact name
        <input name="contactName" defaultValue={stay?.contactName ?? ''} />
      </label>
      <label>
        Contact phone
        <input name="contactPhone" defaultValue={stay?.contactPhone ?? ''} />
      </label>
      <label>
        Notes
        <textarea name="notes" defaultValue={stay?.notes ?? ''} />
      </label>
      <button className="primary" type="submit">
        Save stay
      </button>
    </form>
  );
}
