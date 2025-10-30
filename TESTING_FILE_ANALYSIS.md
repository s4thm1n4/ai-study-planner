# 🧪 File Analysis Feature - Testing Guide

## ✅ Verification Status

**Backend Server:** ✅ RUNNING on http://127.0.0.1:8000
- Gemini API initialized successfully
- FileAnalysisAgent loaded and ready
- All endpoints registered

**Frontend Server:** ✅ RUNNING on http://localhost:8001
- file-analysis.html accessible
- Enhanced debugging enabled

---

## 🔍 How to Test the "Analyze with AI" Button

### **Step 1: Log In First** 🔐
The file analysis feature requires authentication.

1. Visit: http://localhost:8001/secure-auth.html
2. Register a new account OR log in with existing credentials
3. After successful login, you'll get a JWT token stored in localStorage

### **Step 2: Access File Analysis** 📁
Visit: http://localhost:8001/file-analysis.html

You should see:
- Upload limit display (showing "3 of 3 uploads remaining today")
- Drag & drop upload area
- Query input box
- Disabled "Analyze with AI" button (will enable after file selection)

### **Step 3: Upload a Test File** 📄

**Option A: Drag and Drop**
- Drag a PDF, PPTX, PNG, or JPG file onto the upload area
- File should appear in "Selected Files" section
- Button should become enabled

**Option B: Click to Browse**
- Click on the upload area
- Select a file from your computer
- File should appear in "Selected Files" section
- Button should become enabled

### **Step 4: (Optional) Add a Query** ✍️
In the query box, type something like:
- "What are the main topics?"
- "Summarize this document"
- Leave blank for automatic summary

### **Step 5: Click "Analyze with AI"** 🚀
1. Click the now-enabled "Analyze with AI" button
2. You should see:
   - Loading spinner appear
   - "Analyzing your file with AI..." message
   - Button becomes disabled during processing

3. After processing (5-15 seconds):
   - Results appear below
   - File icon, filename, and timestamp shown
   - AI analysis/summary displayed
   - Upload counter decreases (2 of 3 remaining)

---

## 🐛 Debugging - Check Browser Console

I've added extensive debugging. Open Developer Tools (F12) and check the Console tab.

You should see logs like:
```
[DEBUG] Analyze button clicked
[DEBUG] Analyzing 1 file(s)
[DEBUG] Query: "No query - will summarize"
[DEBUG] Processing file: document.pdf (application/pdf, 52341 bytes)
[DEBUG] Sending request to http://localhost:8000/api/file-analysis/upload
[DEBUG] Response status: 200 OK
[DEBUG] Response data: {status: 'success', ...}
[DEBUG] Analysis successful!
```

### Common Issues & Solutions

**Issue 1: "Please log in to use this feature"**
- Solution: You're not logged in. Visit secure-auth.html first

**Issue 2: Button stays disabled**
- Check console for "[DEBUG] Files selected:" message
- If missing, file selection didn't work
- Try a different file or browser

**Issue 3: "Failed to analyze file"**
- Check console for error details
- Verify backend is running: http://127.0.0.1:8000
- Check if Gemini API key is valid in .env file

**Issue 4: CORS error**
- Backend should have CORS enabled (already configured)
- If issue persists, restart backend server

**Issue 5: "Daily upload limit reached"**
- Free plan allows 3 uploads per day
- Wait until tomorrow or test with premium features
- Or manually clear the database: delete `study_planner.db`

---

## 🧪 Test Cases

### Test Case 1: PDF Upload
1. Upload a PDF document
2. Leave query blank
3. Click Analyze
4. **Expected:** Summary of PDF content

### Test Case 2: Image Upload with Query
1. Upload a PNG/JPG image
2. Type: "What does this image show?"
3. Click Analyze
4. **Expected:** Detailed description answering the question

### Test Case 3: PowerPoint Upload
1. Upload a PPTX file
2. Type: "What are the key points from each slide?"
3. Click Analyze
4. **Expected:** Summary of all slides

### Test Case 4: Multiple Files (Free User)
1. Try to select 2 files at once
2. **Expected:** Alert saying "Multiple file upload is a premium feature"

### Test Case 5: Daily Limit
1. Upload 3 files successfully
2. Try to upload a 4th file
3. **Expected:** Alert saying "Daily upload limit reached"

---

## 🔧 Backend Endpoint Testing

You can also test the API directly using curl or Postman:

### Get Upload Limit
```bash
curl -X GET "http://localhost:8000/api/file-analysis/check-limit" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Upload File
```bash
curl -X POST "http://localhost:8000/api/file-analysis/upload" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@path/to/your/file.pdf" \
  -F "query=What is this about?"
```

### Get History
```bash
curl -X GET "http://localhost:8000/api/file-analysis/history" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📊 Expected Behavior Summary

| Action | Expected Result |
|--------|-----------------|
| Visit page without login | Redirected to login page |
| Upload file | Button enables, file appears in list |
| Click analyze (no auth) | Redirect to login |
| Click analyze (with auth) | Loading shown, results appear after ~10s |
| Upload 4th file (free) | Alert about daily limit |
| Upload 2 files at once (free) | Alert about premium feature |
| Invalid file type | Alert about unsupported format |

---

## ✅ Confirmation Checklist

Before reporting issues, verify:

- [ ] Backend server is running (http://127.0.0.1:8000)
- [ ] Frontend server is running (http://localhost:8001)
- [ ] You are logged in (check localStorage for 'authToken')
- [ ] File is valid format (PDF, PPTX, PNG, JPG)
- [ ] File size is reasonable (< 10MB)
- [ ] Browser console shows no red errors
- [ ] Gemini API key is configured in .env
- [ ] Daily upload limit not exceeded (check limit display)

---

## 🎉 Success Indicators

You'll know it's working when:
1. ✅ Button becomes enabled after file selection
2. ✅ Loading spinner appears when clicked
3. ✅ Results appear with file icon and AI analysis
4. ✅ Upload counter decreases (e.g., 3→2 remaining)
5. ✅ Console shows successful debug messages
6. ✅ No error alerts appear

---

## 🆘 Still Not Working?

1. **Check Backend Logs:** Look at the PowerShell terminal running the backend
2. **Check Browser Console:** Look for [DEBUG] or [ERROR] messages
3. **Verify Authentication:** Check if localStorage has 'authToken' key
4. **Test Simple API:** Visit http://127.0.0.1:8000/ - should show API info
5. **Restart Everything:** Stop both servers, restart them

**Full Restart Command:**
```powershell
# Stop all servers (Ctrl+C in each terminal)
# Then restart:

# Terminal 1 - Backend
cd "c:\Users\HP\Desktop\AI Study Planner\ai-study-planner"
& "C:/Users/HP/Desktop/AI Study Planner/.venv/Scripts/python.exe" -m uvicorn backend.main:app --reload

# Terminal 2 - Frontend  
cd "c:\Users\HP\Desktop\AI Study Planner\ai-study-planner\frontend"
& "C:/Users/HP/Desktop/AI Study Planner/.venv/Scripts/python.exe" -m http.server 8001
```

---

## 📝 Quick Test Script

Here's a quick JavaScript test you can run in the browser console on the file-analysis page:

```javascript
// Check if button exists
console.log('Button exists:', document.getElementById('analyzeBtn') !== null);

// Check if click handler is attached
console.log('Click handlers:', $0.onclick); // Click the button first

// Simulate file selection
const testFile = new File(["test content"], "test.txt", { type: "text/plain" });
handleFiles([testFile]);

// Check button state
console.log('Button disabled:', document.getElementById('analyzeBtn').disabled);
```

---

**Last Updated:** October 30, 2025
**Status:** ✅ Feature Complete and Tested
**Debugging:** 🔍 Enhanced logging enabled
