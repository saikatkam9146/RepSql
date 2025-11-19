# Project setup, implementation notes, and step-by-step changes

This document records how the Angular front-end was developed, what changes were made, where to find them, how to run the app, how to reproduce and capture API errors, and server-side guidance for Windows-auth and CORS troubleshooting. Use this as a checklist when you move the project to the machine where the API runs.

---

## Table of contents

- Overview
- How to run the project (dev machine)
- Files and responsibility map
- Step-by-step implementation history (what I changed and why)
- Feature details (pagination, filters, search)
- Services and fallback behavior (withCredentials, empty POST body)
- How to reproduce API errors and capture diagnostic output
- Server-side guidance (Web API 2 / .NET Framework) for CORS + Windows Authentication
- Useful git commits and messages
- Next steps & optional improvements

---

## Overview

This repository contains an Angular (standalone components) front-end for the "RepSql" app. The app was extended to:

- Convert the provided C# DTOs into TypeScript interfaces.
- Add `UsersService` and `DatabasesService` to call backend endpoints (with credentialed requests for NTLM/Windows auth).
- Implement fallback local sample assets (in `src/assets/`) so UI stays functional when the backend is unreachable.
- Add UI features: pagination (10 rows/page), status and department filters, search box, and visible error details for debugging.

The code is committed on `main`. Expect the dev server to run with `npm start` (it will pick a free port if 4200 is in use).

---

## How to run the project (dev machine)

1. Install Node.js (LTS recommended). In this repository we used npm and Angular CLI.
2. From project root (example path `D:\Angular\ReportingSchedulerWeb`):

```powershell
npm install
npm start
```

3. The dev server will print the Local URL (e.g., `http://localhost:4200` or another port). Open that URL in the browser.

4. If you want a quick typecheck only:

```powershell
npx tsc --noEmit
```

---

## Files and responsibility map

Key files created/edited in this work (locations are relative to repo root):

- `src/app/models/user.model.ts` — TypeScript interfaces derived from C# DTOs (UserItem, Department, UserAccess, TimeZoneOffset, UserComplex, DatabaseConnection, UserList, UserEdit, etc.).

- Services:
  - `src/app/services/users.service.ts` — API client for users endpoints. Uses `withCredentials` and sends `null` body for POSTs where backend expects an empty request body. Implements robust error logging and falls back to `src/assets/sample-userlist.json`.
  - `src/app/services/databases.service.ts` — API client for databases endpoints. Uses similar credentialed options and fallbacks to `src/assets/sample-databases.json`.

- Components (UI):
  - `src/app/components/users/` — `users.component.ts`, `users.component.html`, `users.component.scss`. Contains pagination, search, filters and error display.
  - `src/app/components/databases/` — `databases.component.ts`, `databases.component.html`, `databases.component.scss`. Contains pagination, status filter and error display.

- Assets (fallback/sample data):
  - `src/assets/sample-userlist.json` — expanded to ~30 sample users to exercise pagination, filters and search.
  - `src/assets/sample-databases.json` — sample database connection entries.

- Documentation:
  - `DOCS/PROJECT_SETUP_AND_CHANGES.md` — (this file) overview and instructions.

---

## Step-by-step implementation history

This is a compressed chronological log of what I changed and why (useful for review or reproduction):

1. Created TypeScript models by translating the provided C# DTOs into `src/app/models/user.model.ts`.
2. Implemented `UsersService` to call `/api/user/getusers` and `getUser/create/update/delete` endpoints. Key points:
   - Use `withCredentials: true` in requests to send browser credentials for NTLM/Windows auth.
   - Send `null` body for POST calls when the backend expects an empty body (this sets Content-Length: 0).
   - On error, log full details (status, message, url, and server error body if present). On read failure of remote API, fall back to local `assets/sample-userlist.json`.
3. Added `DatabasesService` mirroring the UsersService pattern and falling back to `assets/sample-databases.json`.
4. Updated `UsersComponent` and `DatabasesComponent` to use services and display lists. Implemented:
   - Pagination: 10 rows per page (computed helpers: filteredUsers, pagedUsers, totalPages, goToPage).
   - Filters: Status (Active/Inactive/All) and Department (select populated from API Departments array). Default status = Active.
   - Search box (Users page): searches across ID, first/last name, email, NT ID, department, and access description.
   - Error handling: component captures `lastError` and displays JSON in the UI for easy copy/paste.
   - Styling: small layout and CSS improvements for the new controls and error blocks.
5. Added and expanded `src/assets/sample-userlist.json` (about 30 users) and `src/assets/sample-databases.json` for robust offline testing.
6. Iterative fixes:
   - Ensure `department` select uses `[ngValue]` to bind numeric IDs (avoids string coercion and filter mismatch).
   - Fix template bindings and non-null concerns while keeping templates defensive.
7. Committed changes and pushed to `origin main`.

---

## Feature details: pagination, filters, search

- Pagination
  - Page size fixed at 10 in components (`pageSize = 10`). Computed properties compute `filteredUsers` / `filteredDatabases` followed by `pagedUsers` / `pagedDatabases`.
  - Controls are placed bottom-left of the table (Previous / Page N / Next) in the table footer.

- Filters
  - Status filter (bottom-right) respects `fcApprovalStatus` value on user records. This code treats `"Approved"` as active — adjust if your backend uses different strings.
  - Department filter is populated from the `Departments` element returned by `getUsers()` or from the sample data.
  - Department select uses `[ngValue]` so the model receives numeric values (not strings), preventing mismatches.

- Search
  - The search input sits left of the Add button in the header. It filters across multiple columns (id, names, email, NT id, department name, access description).
  - Search is case-insensitive and trimmed.

---

## Services and fallback behavior (important)

- Both `UsersService` and `DatabasesService` use `withCredentials: true` so the browser will send Windows credentials (NTLM/Kerberos) when the backend is configured to accept them.
- POST endpoints that expect an empty body are called with `null` (not `{}`) to produce Content-Length: 0 — this matched the backend behavior during troubleshooting.
- On network or server error the services log a helpful object to the browser console and return a fallback from the `assets/` directory so pages remain usable.

Files to review:
- `src/app/services/users.service.ts`
- `src/app/services/databases.service.ts`

---

## How to reproduce API errors and capture diagnostic output

1. From the app UI (Users or Databases page)
   - When an API call fails the page will show an error message and a JSON block containing the `lastError` object captured from Angular's HttpClient. Copy that JSON and paste in your reply.

2. From PowerShell (recommended to capture full response when you run the API-enabled machine):

```powershell
# Replace host:port with your API host
try {
  $r = Invoke-WebRequest -Uri 'http://localhost:55009/api/user/getusers' -Method Post -Body $null -UseBasicParsing -ErrorAction Stop
  Write-Output "STATUS: $($r.StatusCode)"
} catch {
  Write-Output "ERROR: $($_.Exception.Message)"
  if ($_.Exception.Response) {
    $resp = $_.Exception.Response
    $sr = New-Object System.IO.StreamReader($resp.GetResponseStream())
    $body = $sr.ReadToEnd()
    Write-Output "RESPONSE_STATUS: $($resp.StatusCode)"
    Write-Output "RESPONSE_HEADERS:"; $resp.Headers | Format-List | Out-String | Write-Output
    Write-Output "RESPONSE_BODY:"; Write-Output $body
  }
}
```

Paste the output here and I will diagnose if it's a connection/port issue, a CORS preflight problem (missing Access-Control-Allow-* headers on OPTIONS), or a Windows-auth 401/403 issue.

---

## Server-side guidance (Web API 2 / .NET Framework)

Common issues when using Windows Authentication + CORS:

- IIS (or IIS Express) may block anonymous OPTIONS preflight requests when Windows Authentication is enabled. Browsers send an OPTIONS preflight for credentialed cross-origin requests. If IIS rejects OPTIONS before CORS middleware runs, the browser will get no CORS headers and the request fails.

Two reliable options:

1) Allow anonymous access to OPTIONS requests (quick):
   - In `web.config` for your Web API project, allow anonymous for OPTIONS requests or add a message handler to short-circuit OPTIONS and return the proper headers.

2) Add a `PreflightRequestsHandler` DelegatingHandler (server-side) that intercepts OPTIONS and returns the required CORS headers and 200 without authentication. Example (C#):

```csharp
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

public class PreflightRequestsHandler : DelegatingHandler
{
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        if (request.Method == HttpMethod.Options)
        {
            var response = new HttpResponseMessage(HttpStatusCode.OK);
            response.Headers.Add("Access-Control-Allow-Origin", "<your-client-origin>");
            response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Accept");
            response.Headers.Add("Access-Control-Allow-Credentials", "true");
            var tsc = new TaskCompletionSource<HttpResponseMessage>();
            tsc.SetResult(response);
            return tsc.Task;
        }

        return base.SendAsync(request, cancellationToken);
    }
}
```

Register the handler in `WebApiConfig.Register` before other handlers:

```csharp
config.MessageHandlers.Add(new PreflightRequestsHandler());
```

3) Use `Microsoft.AspNet.WebApi.Cors` and enable CORS with credentials from code (not just web.config). Example:

```csharp
using System.Web.Http;
using System.Web.Http.Cors;

public static void Register(HttpConfiguration config)
{
    var cors = new EnableCorsAttribute("http://localhost:4200", "Content-Type, Accept", "GET,POST,PUT,DELETE,OPTIONS")
    {
        SupportsCredentials = true
    };
    config.EnableCors(cors);

    // other routing stuff
}
```

Important: When `SupportsCredentials = true`, you cannot use `*` as `Access-Control-Allow-Origin` — you must specify the exact origin.

If you paste the browser console error + network request/response headers here, I will produce the exact minimal server-side change that you should paste into your Web API project.

---

## Useful git commits and messages

- `8469cf6` — chore(frontend): add pagination, filters, search, sample data and improved error logging
- `6071e49` — feat(users): add backend models, service wiring and sample fallback; update components
- `913064b` — chore: add API integration, models, services and docs

(You can see the full history with `git log --oneline`.)

---

## Next steps & optional improvements

- Add an environment configuration (e.g. `environment.ts`) for `apiHost` so you can change host:port without modifying source files.
- Add a small "copy" button for the displayed error JSON to quickly copy into the clipboard.
- Add unit tests for `UsersService`/`DatabasesService` that mock HttpClient and assert fallback behavior.
- Improve UX: page-size selector (10/25/50), total record count, and an improved pagination control.

---

If you pull this repo to your API machine and run the app, paste the exact JSON or PowerShell output displayed by the app (or returned by the PowerShell POST test) and I will produce the precise server-side patch for .NET Framework Web API required to allow credentialed, cross-origin calls from the browser.

If you'd like I can also add a `README.md` at the repo root with a shortened version of these run steps — tell me and I'll add it.
