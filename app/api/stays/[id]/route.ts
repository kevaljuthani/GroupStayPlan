import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/request-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const stayUpdateSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  mapsLink: z.string().optional(),
  rating: z.number().nullable().optional(),
  pricePerNight: z.number().nullable().optional(),
  foodIncluded: z.boolean().default(false),
  images: z.array(z.string()).default([]),
  recommendedBy: z.array(z.string()).default([]),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  notes: z.string().optional()
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = stayUpdateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const updated = await prisma.stay.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      mapsLink: parsed.data.mapsLink || null,
      contactName: parsed.data.contactName || null,
      contactPhone: parsed.data.contactPhone || null,
      notes: parsed.data.notes || null
    }
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.stay.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
