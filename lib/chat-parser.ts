export type ParsedStay = {
  name: string;
  address: string;
  mapsLink?: string;
  rating?: number;
  pricePerNight?: number;
  foodIncluded: boolean;
  images: string[];
  recommendedBy: string[];
  contactName?: string;
  contactPhone?: string;
  notes?: string;
  sourceMessage: string;
};

function readField(block: string, labels: string[]) {
  for (const label of labels) {
    const regex = new RegExp(`(?:^|\\n)${label}\\s*:\\s*(.+)`, 'i');
    const match = block.match(regex);
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  return undefined;
}

export function parseWhatsAppExport(chatText: string): ParsedStay[] {
  const blocks = chatText
    .split(/\n\s*---+\s*\n/g)
    .map((b) => b.trim())
    .filter(Boolean);

  return blocks
    .map((block) => {
      const name = readField(block, ['Name', 'Stay Name', 'Property']) ?? 'Untitled Stay';
      const address = readField(block, ['Address', 'Location']) ?? 'Address pending';
      const mapsLink = readField(block, ['Google Map', 'Maps', 'Map Link']);
      const ratingRaw = readField(block, ['Rating']);
      const priceRaw = readField(block, ['Price', 'Price Per Night']);
      const foodRaw = readField(block, ['Food', 'Food Included']);
      const imageRaw = readField(block, ['Images', 'Image']);
      const recommenderRaw = readField(block, ['Recommended By', 'Recommender']);

      const rating = ratingRaw ? Number.parseFloat(ratingRaw) : undefined;
      const pricePerNight = priceRaw ? Number.parseInt(priceRaw.replace(/[^\d]/g, ''), 10) : undefined;
      const foodIncluded = foodRaw ? /(yes|included|with)/i.test(foodRaw) : false;
      const images = imageRaw ? imageRaw.split(',').map((s) => s.trim()).filter(Boolean) : [];
      const recommendedBy = recommenderRaw
        ? recommenderRaw.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      return {
        name,
        address,
        mapsLink,
        rating: Number.isNaN(rating) ? undefined : rating,
        pricePerNight: Number.isNaN(pricePerNight) ? undefined : pricePerNight,
        foodIncluded,
        images,
        recommendedBy,
        contactName: readField(block, ['Contact Name']),
        contactPhone: readField(block, ['Contact Phone', 'Phone']),
        notes: readField(block, ['Notes', 'Comment']),
        sourceMessage: block
      };
    })
    .filter((entry) => Boolean(entry.name));
}
