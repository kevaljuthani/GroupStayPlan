import { extractStaysUsingOllama } from '@/lib/ollama-extractor';
import { parseWhatsAppExport } from '@/lib/chat-parser';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/request-auth';
import { extractTextFilesFromZipBuffer } from '@/lib/zip-parser';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const jsonBodySchema = z.object({
  groupId: z.string().min(1),
  chatText: z.string().min(10)
});

async function importEntries(groupId: string, chatText: string) {
  const fallbackItems = parseWhatsAppExport(chatText);
  let aiItems = [] as Awaited<ReturnType<typeof extractStaysUsingOllama>>;

  try {
    aiItems = await extractStaysUsingOllama(chatText);
  } catch {
    aiItems = [];
  }

  const items = aiItems.length > 0 ? aiItems : fallbackItems;
  if (items.length === 0) {
    return { imported: 0 };
  }

  await prisma.stay.createMany({
    data: items.map((entry) => ({
      ...entry,
      groupId,
      mapsLink: entry.mapsLink || null,
      contactName: entry.contactName || null,
      contactPhone: entry.contactPhone || null,
      notes: entry.notes || null
    }))
  });

  return { imported: items.length };
}

async function handleJsonRequest(request: NextRequest) {
  const parsed = jsonBodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const result = await importEntries(parsed.data.groupId, parsed.data.chatText);
  if (result.imported === 0) {
    return NextResponse.json({ error: 'No entries detected.' }, { status: 400 });
  }

  return NextResponse.json(result);
}

async function handleFormDataRequest(request: NextRequest) {
  const formData = await request.formData();
  const groupId = String(formData.get('groupId') ?? '').trim();
  if (!groupId) {
    return NextResponse.json({ error: 'groupId is required' }, { status: 400 });
  }

  const chatFile = formData.get('chatFile');
  const rawChatText = String(formData.get('chatText') ?? '').trim();

  const importedByFile: { fileName: string; imported: number }[] = [];
  let imported = 0;

  if (chatFile instanceof File) {
    const fileBuffer = Buffer.from(await chatFile.arrayBuffer());
    const isZip = chatFile.name.toLowerCase().endsWith('.zip') || chatFile.type === 'application/zip';

    if (isZip) {
      const files = await extractTextFilesFromZipBuffer(fileBuffer);
      for (const txtFile of files) {
        const result = await importEntries(groupId, txtFile.content);
        imported += result.imported;
        importedByFile.push({ fileName: txtFile.fileName, imported: result.imported });
      }
    } else {
      const result = await importEntries(groupId, fileBuffer.toString('utf8'));
      imported += result.imported;
      importedByFile.push({ fileName: chatFile.name, imported: result.imported });
    }
  }

  if (rawChatText) {
    const result = await importEntries(groupId, rawChatText);
    imported += result.imported;
    importedByFile.push({ fileName: 'inline-text', imported: result.imported });
  }

  if (imported === 0) {
    return NextResponse.json(
      { error: 'No entries detected from uploaded file or text.' },
      { status: 400 }
    );
  }

  return NextResponse.json({ imported, importedByFile });
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const contentType = request.headers.get('content-type') ?? '';
  if (contentType.includes('multipart/form-data')) {
    return handleFormDataRequest(request);
  }

  return handleJsonRequest(request);
}
