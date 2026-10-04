import "server-only";

const PIN_FILE_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";

// Generous for a phone photo, small enough to stay fast mid-demo. Pinata's
// own free-tier limit is higher; this just fails fast instead of hanging on
// a slow upload in front of a live audience.
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export function isPinataConfigured() {
  return Boolean(process.env.IPFS_API_KEY && process.env.IPFS_API_SECRET);
}

export class IpfsUploadError extends Error {}

/**
 * Pins a file to IPFS via Pinata's classic key+secret API and returns an
 * `ipfs://<cid>` URI — the exact shape lib/web3/format.ts's toIpfsUrl()
 * already resolves through NEXT_PUBLIC_IPFS_GATEWAY, and the exact shape
 * TreeRegistry/TreeBond expect for metadataCID/imageCid.
 */
export async function pinFileToIpfs(
  file: File,
  label: string,
): Promise<{ cid: string; uri: string }> {
  const apiKey = process.env.IPFS_API_KEY;
  const apiSecret = process.env.IPFS_API_SECRET;
  if (!apiKey || !apiSecret) {
    throw new IpfsUploadError(
      "IPFS pinning is not configured on this server yet.",
    );
  }
  if (!file.type.startsWith("image/")) {
    throw new IpfsUploadError("Only image files are accepted.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new IpfsUploadError("Image is larger than 10MB.");
  }

  const body = new FormData();
  body.append("file", file, file.name);
  body.append(
    "pinataMetadata",
    JSON.stringify({ name: `treebond-${label}-${Date.now()}` }),
  );

  const res = await fetch(PIN_FILE_URL, {
    method: "POST",
    headers: {
      pinata_api_key: apiKey,
      pinata_secret_api_key: apiSecret,
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new IpfsUploadError(
      `Pinata rejected the upload (${res.status}): ${text.slice(0, 200) || res.statusText}`,
    );
  }

  const json = (await res.json()) as { IpfsHash: string };
  return { cid: json.IpfsHash, uri: `ipfs://${json.IpfsHash}` };
}
