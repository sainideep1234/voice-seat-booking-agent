import { headers } from 'next/headers';
import { ImageResponse } from 'next/og';
import getImageSize from 'buffer-image-size';
import mime from 'mime';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { APP_CONFIG_DEFAULTS } from '@/app-config';
import { getAppConfig } from '@/lib/utils';

type Dimensions = {
  width: number;
  height: number;
};
type ImageData = {
  base64: string;
  dimensions: Dimensions;
};
export const alt = 'About Acme';
export const size = {
  width: 1200,
  height: 628,
};
function isRemoteFile(uri: string) {
  return uri.startsWith('http');
}
function doesLocalFileExist(uri: string) {
  return existsSync(join(process.cwd(), uri));
}
async function loadFileData(filePath: string): Promise<ArrayBuffer> {
  if (isRemoteFile(filePath)) {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${filePath} - ${response.status} ${response.statusText}`);
    }
    return await response.arrayBuffer();
  }
  if (doesLocalFileExist(filePath)) {
    const buffer = await readFile(join(process.cwd(), filePath));
    return buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    ) as ArrayBuffer;
  }
  const publicFilePath = filePath.replace('public/', '');
  const fontUrl = `https://${process.env.VERCEL_URL}/${publicFilePath}`;
  const response = await fetch(fontUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${fontUrl} - ${response.status} ${response.statusText}`);
  }
  return await response.arrayBuffer();
}
async function getImageData(uri: string, fallbackUri?: string): Promise<ImageData> {
  try {
    const fileData = await loadFileData(uri);
    const buffer = Buffer.from(fileData);
    const mimeType = mime.getType(uri);
    return {
      base64: `data:${mimeType};base64,${buffer.toString('base64')}`,
      dimensions: getImageSize(buffer),
    };
  } catch (e) {
    if (fallbackUri) {
      return getImageData(fallbackUri, fallbackUri);
    }
    throw e;
  }
}
function scaleImageSize(
  size: {
    width: number;
    height: number;
  },
  desiredHeight: number
) {
  const scale = desiredHeight / size.height;
  return {
    width: size.width * scale,
    height: desiredHeight,
  };
}
function cleanPageTitle(appName: string) {
  if (appName === APP_CONFIG_DEFAULTS.pageTitle) {
    return 'Voice agent';
  }
  return appName;
}
export const contentType = 'image/png';
export default async function Image() {
  const hdrs = await headers();
  const appConfig = await getAppConfig(hdrs);
  const pageTitle = cleanPageTitle(appConfig.pageTitle);
  const logoUri = appConfig.logoDark || appConfig.logo;
  const isLogoUriLocal = logoUri.includes('lk-logo');
  const wordmarkUri = logoUri === APP_CONFIG_DEFAULTS.logoDark ? 'public/lk-wordmark.svg' : logoUri;
  let commitMonoData: ArrayBuffer | undefined;
  let everettLightData: ArrayBuffer | undefined;
  try {
    commitMonoData = await loadFileData('public/commit-mono-400-regular.woff');
    everettLightData = await loadFileData('public/everett-light.woff');
  } catch (e) {
    console.error('Failed to load fonts:', e);
  }
  const { base64: bgSrcBase64 } = await getImageData('public/opengraph-image-bg.png');
  const { base64: wordmarkSrcBase64, dimensions: wordmarkDimensions } = isLogoUriLocal
    ? await getImageData(wordmarkUri)
    : await getImageData(logoUri);
  const wordmarkSize = scaleImageSize(wordmarkDimensions, isLogoUriLocal ? 32 : 64);
  const { base64: logoSrcBase64, dimensions: logoDimensions } = await getImageData(
    logoUri,
    'public/lk-logo-dark.svg'
  );
  const logoSize = scaleImageSize(logoDimensions, 24);
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size.width,
          height: size.height,
          backgroundImage: `url(${bgSrcBase64})`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 30,
            left: 30,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <img src={wordmarkSrcBase64} width={wordmarkSize.width} height={wordmarkSize.height} />
        </div>

        <div
          style={{
            position: 'absolute',
            top: 200,
            left: 460,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <img src={logoSrcBase64} width={logoSize.width} height={logoSize.height} />
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 100,
            left: 30,
            width: '380px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div
            style={{
              backgroundColor: '#1F1F1F',
              padding: '2px 8px',
              borderRadius: 4,
              width: 72,
              fontSize: 12,
              fontFamily: 'CommitMono',
              fontWeight: 600,
              color: '#999999',
              letterSpacing: 0.8,
            }}
          >
            SANDBOX
          </div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 300,
              fontFamily: 'Everett',
              color: 'white',
              lineHeight: 1,
            }}
          >
            {pageTitle}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        ...(commitMonoData
          ? [
              {
                name: 'CommitMono',
                data: commitMonoData,
                style: 'normal' as const,
                weight: 400 as const,
              },
            ]
          : []),
        ...(everettLightData
          ? [
              {
                name: 'Everett',
                data: everettLightData,
                style: 'normal' as const,
                weight: 300 as const,
              },
            ]
          : []),
      ],
    }
  );
}
