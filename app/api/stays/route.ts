import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/request-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const staySchema = z.object({
  groupId: z.string().min(1),
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

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = staySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const created = await prisma.stay.create({
    data: {
      ...parsed.data,
      mapsLink: parsed.data.mapsLink || null,
      contactName: parsed.data.contactName || null,
      contactPhone: parsed.data.contactPhone || null,
      notes: parsed.data.notes || null
    }
  });

  return NextResponse.json(created);
}
