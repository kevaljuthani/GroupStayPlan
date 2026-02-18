const ZIP_LOCAL_FILE_HEADER = 0x04034b50;
const COMPRESSION_STORED = 0;
const COMPRESSION_DEFLATE = 8;

function decodeFileName(rawName: Buffer): string {
  return rawName.toString('utf8').replace(/\0/g, '');
}

export type ZipTextFile = {
  fileName: string;
  content: string;
};

export async function extractTextFilesFromZipBuffer(data: Buffer): Promise<ZipTextFile[]> {
  const { inflateRaw } = await import('node:zlib');
  const { promisify } = await import('node:util');
  const inflateRawAsync = promisify(inflateRaw);

  const files: ZipTextFile[] = [];
  let offset = 0;

  while (offset + 4 <= data.length) {
    const signature = data.readUInt32LE(offset);
    if (signature !== ZIP_LOCAL_FILE_HEADER) {
      break;
    }

    const compressionMethod = data.readUInt16LE(offset + 8);
    const compressedSize = data.readUInt32LE(offset + 18);
    const fileNameLength = data.readUInt16LE(offset + 26);
    const extraFieldLength = data.readUInt16LE(offset + 28);

    const fileNameStart = offset + 30;
    const fileNameEnd = fileNameStart + fileNameLength;
    const fileName = decodeFileName(data.subarray(fileNameStart, fileNameEnd));

    const contentStart = fileNameEnd + extraFieldLength;
    const contentEnd = contentStart + compressedSize;

    if (contentEnd > data.length) {
      break;
    }

    const compressed = data.subarray(contentStart, contentEnd);

    if (!fileName.endsWith('/') && /\.txt$/i.test(fileName)) {
      let contentBuffer: Buffer;
      if (compressionMethod === COMPRESSION_STORED) {
        contentBuffer = Buffer.from(compressed);
      } else if (compressionMethod === COMPRESSION_DEFLATE) {
        contentBuffer = await inflateRawAsync(compressed);
      } else {
        throw new Error(`Unsupported ZIP compression method: ${compressionMethod}`);
      }

      files.push({
        fileName,
        content: contentBuffer.toString('utf8')
      });
    }

    offset = contentEnd;
  }

  return files;
}
