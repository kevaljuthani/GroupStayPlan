import type { Stay } from '@prisma/client';

type Props = {
  stay: Stay;
};

const fallbackImage =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';

export function StayCard({ stay }: Props) {
  const images = stay.images.length > 0 ? stay.images : [fallbackImage];

  return (
    <article className="card">
      <div className="image-strip">
        {images.map((img, index) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={`${stay.id}-${index}`} src={img} alt={`${stay.name} view ${index + 1}`} />
        ))}
      </div>
      <div className="content">
        <h3>{stay.name}</h3>
        <div className="meta">{stay.address}</div>
        <div className="meta">
          {stay.rating ? `⭐ ${stay.rating.toFixed(1)}` : 'No rating'} ·{' '}
          {stay.pricePerNight ? `₹${stay.pricePerNight}/night` : 'Price pending'}
        </div>
        <div className="pills">
          <span className="pill">{stay.foodIncluded ? 'Food included' : 'Food not included'}</span>
          {stay.recommendedBy.map((person) => (
            <span key={person} className="pill">
              Suggested by {person}
            </span>
          ))}
        </div>
        <div className="actions">
          {stay.mapsLink ? (
            <a className="btn" href={stay.mapsLink} target="_blank" rel="noreferrer">
              Open map
            </a>
          ) : null}
          {stay.contactPhone ? <a className="btn" href={`tel:${stay.contactPhone}`}>Call contact</a> : null}
        </div>
      </div>
    </article>
  );
}
