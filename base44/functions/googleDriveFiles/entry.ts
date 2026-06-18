import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CONNECTOR_ID = '6a344ff39cf46d20611a4dba';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { action, fileId, pageToken } = body;

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    // action: "list" — list files (images, PDFs, docs)
    if (action === 'list' || !action) {
      const q = encodeURIComponent("mimeType='image/png' or mimeType='image/jpeg' or mimeType='image/gif' or mimeType='image/webp' or mimeType='application/pdf' or mimeType='text/plain'");
      const fields = encodeURIComponent('files(id,name,mimeType,thumbnailLink,size,modifiedTime),nextPageToken');
      let url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&pageSize=30&orderBy=modifiedTime+desc`;
      if (pageToken) url += `&pageToken=${pageToken}`;

      const res = await fetch(url, { headers: authHeader });
      if (!res.ok) {
        const err = await res.json();
        return Response.json({ error: err.error?.message || 'Drive API error' }, { status: res.status });
      }
      const data = await res.json();
      return Response.json({ files: data.files || [], nextPageToken: data.nextPageToken || null });
    }

    // action: "download" — get a signed download URL (for images/PDFs)
    if (action === 'download') {
      if (!fileId) return Response.json({ error: 'fileId required' }, { status: 400 });

      // Get file metadata first
      const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=name,mimeType,size`, { headers: authHeader });
      if (!metaRes.ok) return Response.json({ error: 'File not found' }, { status: 404 });
      const meta = await metaRes.json();

      // Download the file content
      const dlRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, { headers: authHeader });
      if (!dlRes.ok) return Response.json({ error: 'Download failed' }, { status: 500 });

      const arrayBuffer = await dlRes.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      const base64 = btoa(String.fromCharCode(...uint8));
      const dataUrl = `data:${meta.mimeType};base64,${base64}`;

      // Upload to Base44 storage
      const blob = new Blob([uint8], { type: meta.mimeType });
      const formData = new FormData();
      formData.append('file', blob, meta.name);

      const uploadRes = await base44.asServiceRole.integrations.Core.UploadFile({ file: blob });
      return Response.json({ file_url: uploadRes.file_url, name: meta.name, mimeType: meta.mimeType });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    // If connection not found, signal "not connected"
    if (error.message?.includes('not found') || error.message?.includes('connection')) {
      return Response.json({ error: 'not_connected' }, { status: 403 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
});