const {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions
} = require('@azure/storage-blob');

const path = require('path');
const { v4: uuidv4 } = require('uuid');

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_CONTAINER_NAME || 'product-images';

if (!connectionString) {
  throw new Error('Missing AZURE_STORAGE_CONNECTION_STRING in .env');
}

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

const accountName = blobServiceClient.accountName;

const accountKey = connectionString
  .split(';')
  .find(x => x.startsWith('AccountKey='))
  .replace('AccountKey=', '');

const sharedKeyCredential = new StorageSharedKeyCredential(
  accountName,
  accountKey
);


const containerClient = blobServiceClient.getContainerClient(containerName);

async function ensureContainerExists() {
  await containerClient.createIfNotExists();
}

function getBlobName(originalName) {
  const ext = path.extname(originalName || '.jpg').toLowerCase();
  const safeExt = ext || '.jpg';
  return `${uuidv4()}${safeExt}`;
}

async function uploadBuffer(buffer, originalName, contentType) {
  await ensureContainerExists();
  const blobName = getBlobName(originalName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: {
      blobContentType: contentType || 'application/octet-stream'
    }
  });

  return blobName;
}

function isDataUrl(value) {
  return typeof value === 'string' && value.startsWith('data:');
}

async function uploadBase64ToAzure(dataUrl, originalName = 'upload.jpg') {
  if (!isDataUrl(dataUrl)) return null;

  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches) return null;

  const mimeType = matches[1];
  const base64Body = matches[2];
  const buffer = Buffer.from(base64Body, 'base64');
  return uploadBuffer(buffer, originalName, mimeType);
}

async function deleteBlob(blobName) {
  if (!blobName) return;

  try {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();
  } catch (err) {
    console.error(`Failed to delete Azure blob ${blobName}:`, err.message);
  }
}

function getBlobUrl(blobName) {
  if (!blobName) return null;
  return `${containerClient.url}/${blobName}`;
}

function resolveBlobUrl(blobName) {
  if (!blobName) return null;

  if (/^https?:\/\//i.test(blobName)) {
    return blobName;
  }

  const expiresOn = new Date();
  expiresOn.setHours(expiresOn.getHours() + 2);

  const sasToken = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"),
      expiresOn,
    },
    sharedKeyCredential
  ).toString();

  return `${containerClient.getBlockBlobClient(blobName).url}?${sasToken}`;
}

function getBlobNameFromUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const prefix = new URL(containerClient.url).pathname;
    if (!parsed.pathname.startsWith(prefix)) return null;
    return parsed.pathname.slice(prefix.length).replace(/^\//, '');
  } catch (err) {
    return null;
  }
}

module.exports = {
  uploadBuffer,
  uploadBase64ToAzure,
  deleteBlob,
  getBlobUrl,
  resolveBlobUrl,
  getBlobNameFromUrl
};