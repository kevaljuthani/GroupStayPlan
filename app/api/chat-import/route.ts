import { parseWhatsAppExport } from '@/lib/chat-parser';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/request-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const bodySchema = z.object({
  groupId: z.string().min(1),
  chatText: z.string().min(10)
});

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const items = parseWhatsAppExport(parsed.data.chatText);
  if (items.length === 0) {
    return NextResponse.json({ error: 'No entries detected.' }, { status: 400 });
  }

  await prisma.stay.createMany({
    data: items.map((entry) => ({
      ...entry,
      groupId: parsed.data.groupId,
      mapsLink: entry.mapsLink || null,
      contactName: entry.contactName || null,
      contactPhone: entry.contactPhone || null,
      notes: entry.notes || null
    }))
  });

  return NextResponse.json({ imported: items.length });
}
