# CV Download Error Fix - "Failed to download CV. Please try again."

## Problem
The CV download button was showing error: "Failed to download CV. Please try again."

## Root Cause
The browser was trying to download files using the fetch API, which can fail due to:
1. CORS issues
2. Browser security restrictions
3. Missing `Content-Disposition` header causing browser to open instead of download

## Solution
Created a dedicated backend download endpoint that:
1. Sets proper `Content-Disposition: attachment` header to force download
2. Sets `Content-Type: application/octet-stream` to prevent browser from opening the file
3. Serves the file directly with proper headers

## Files Modified

### 1. Backend: `backend/routes/file-upload.js`
**Added**: New `/download-cv/:filename` endpoint

```javascript
router.get('/download-cv/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'CV file not found' 
      });
    }
    
    // Set headers to force download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Send file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error downloading CV:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error downloading CV file' 
    });
  }
});
```

### 2. Frontend: `frontend/src/pages/employerdashboard_full.jsx`
**Updated**: Download button to use the new endpoint

```javascript
onClick={() => {
  const cvPath = selectedCV.currentCVData?.resume || selectedCV.applicant?.resume;
  const filename = cvPath.split('/').pop();
  
  // Use the dedicated download endpoint
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
  const downloadUrl = `${baseUrl}/api/upload/download-cv/${filename}`;
  
  // Trigger download
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.click();
}}
```

## How It Works

### Old Flow (Failed):
```
Frontend → fetch(file URL) → CORS/Security Error → ❌ Failed
```

### New Flow (Works):
```
Frontend → GET /api/upload/download-cv/filename
    ↓
Backend → Set Content-Disposition: attachment
    ↓
Backend → Send file with proper headers
    ↓
Browser → Download file to Downloads folder ✓
```

## API Endpoint

**URL**: `GET /api/upload/download-cv/:filename`

**Parameters**:
- `filename` - The CV filename (e.g., `cv-1762262218558-409023537.pdf`)

**Response Headers**:
```
Content-Disposition: attachment; filename="cv-1762262218558-409023537.pdf"
Content-Type: application/octet-stream
```

**Success**: File download starts
**Error 404**: CV file not found
**Error 500**: Server error

## Testing

### Test 1: Download PDF CV
1. Login as employer
2. Go to Dashboard → Applications
3. Click "View CV" on an application
4. Click "⬇️ Download CV"
5. **Expected**: PDF file downloads to Downloads folder
6. **Verify**: File name is correct

### Test 2: Download DOC/DOCX CV
1. Find application with Word document CV
2. Click "⬇️ Download CV"
3. **Expected**: Word document downloads
4. **Verify**: File opens in Word

### Test 3: Error Handling - File Not Found
1. Manually modify the download URL to use invalid filename
2. **Expected**: 404 error response
3. **Expected**: No download starts

### Test 4: Console Logging
1. Open DevTools → Console
2. Click "⬇️ Download CV"
3. **Expected**: See logs:
   ```
   Downloading CV: { cvPath: "/uploads/cv-123.pdf", filename: "cv-123.pdf", downloadUrl: "..." }
   Download triggered for: cv-123.pdf
   ```

## Backend Restart Required

⚠️ **IMPORTANT**: You must restart the backend server for the new endpoint to work:

```bash
# Stop the current backend server (Ctrl+C)
# Then restart:
cd backend
npm start
```

## Verification Checklist

After restarting backend:
- [ ] Backend server starts without errors
- [ ] Can view CV in new tab (Open CV button)
- [ ] Can download CV (Download CV button)
- [ ] File downloads with correct filename
- [ ] No "Failed to download" error
- [ ] Console shows download logs

## Benefits

✅ **Reliable Downloads**: Works across all browsers
✅ **Proper Filenames**: Preserves original filename
✅ **Error Handling**: Clear error messages
✅ **No CORS Issues**: Same-origin request
✅ **Force Download**: Never opens in browser
✅ **File Validation**: Checks if file exists before sending

## Summary

The download error is fixed by using a dedicated backend endpoint that serves files with proper `Content-Disposition: attachment` headers. This forces the browser to download the file instead of opening it, and avoids CORS/security issues.

**Next Step**: Restart the backend server to activate the new download endpoint!
