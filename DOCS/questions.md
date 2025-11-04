# Recent Q&A (last 3–4 exchanges) and paging/filtering notes

Date: 2025-11-04

This document contains the most recent 3–4 question/answer exchanges from our session (copied for traceability), followed by a concise pointer to where paging and filtering logic lives in the frontend code and what it does.

---

## Q&A 1 — How to open IIS on my local API machine

Q: how to open IIS in my local api machine

A (summary):
- GUI: Press Win, type "IIS" and open "Internet Information Services (IIS) Manager" or press Win+R and run `inetmgr`.
- PowerShell (quick): `Start-Process inetmgr`.
- If `inetmgr` is missing, enable IIS Management Console via Control Panel → "Turn Windows features on or off" or use DISM/PowerShell to install features (run as Administrator):

```powershell
# as Admin
dism /online /enable-feature /featurename:IIS-ManagementConsole /all
dism /online /enable-feature /featurename:IIS-WebServer /all
dism /online /enable-feature /featurename:IIS-WindowsAuthentication /all
```

- If you use IIS Express (Visual Studio), use the system-tray IIS Express icon and check `.vs/<Solution>/config/applicationhost.config` or `%USERPROFILE%\Documents\IISExpress\config`.

- How to change authentication (quick dev/test): select site in IIS Manager → Authentication → enable/disable Anonymous or Windows Authentication. For CORS preflight testing you can temporarily enable Anonymous while keeping Windows Auth enabled so OPTIONS can be served anonymously and POST/GET still require auth.

---

## Q&A 2 — Windows can't find `inetmgr`

Q: windows cant find inetmgr

A (summary):
- If `inetmgr` isn't available, install the IIS Management Console as described above (Control Panel → Turn Windows features on or off OR use the DISM commands). After installing, run `Start-Process inetmgr` or `inetmgr` again to open the GUI.
- Confirm presence with PowerShell:

```powershell
Test-Path 'C:\Windows\System32\inetsrv\InetMgr.exe'
```

- If you only need to run the API locally via Visual Studio, IIS Express may be sufficient and no full IIS is required.

---

## Q&A 3 — Using Postman to diagnose CORS / NTLM

Q: I have the postman installed can something be done from this?

A (summary):
- Yes. Postman bypasses browser CORS enforcement so it helps verify server behavior for OPTIONS (preflight) and POST (NTLM) requests.
- Suggested checks to paste back:
  - OPTIONS preflight (method OPTIONS, set `Origin: http://localhost:4200`, `Access-Control-Request-Method: POST`, `Access-Control-Request-Headers: Content-Type, Authorization`) — expected: 200 with `Access-Control-Allow-Origin`, `Access-Control-Allow-Credentials`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`.
  - POST with NTLM (NTLM auth in Postman) — expected: 200 when credentials are correct; check `WWW-Authenticate` header on 401 responses.
  - POST without credentials (control) — to distinguish auth vs CORS problems.
- Copy the exact status, response headers and body for diagnosis.

---

## Q&A 4 — Where to add `PreflightRequestsHandler` and register it

Q: Okay but where to add this PreflightRequestsHandler class in web api and do we have to register it somewhere or use it somewhere in the project?

A (summary / copy-paste-ready instructions):
- Add a new C# file anywhere in your Web API project (e.g., `App_Start\\Handlers\\PreflightRequestsHandler.cs` or `Handlers\\PreflightRequestsHandler.cs`). Include it in the project and compile.
- Handler behaviour: short-circuit `OPTIONS` requests and return `Access-Control-Allow-*` headers, including `Access-Control-Allow-Credentials: true`. Do not use `Access-Control-Allow-Origin: *` if credentials are needed.
- Example DelegatingHandler (replace namespace):

```csharp
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;

namespace YourProjectNamespace.Handlers
{
    public class PreflightRequestsHandler : DelegatingHandler
    {
        private static readonly string[] AllowedOrigins = new[] { "http://localhost:4200" };

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            if (request.Method == HttpMethod.Options)
            {
                var origin = request.Headers?.Origin?.ToString() ?? string.Empty;
                var response = new HttpResponseMessage(HttpStatusCode.OK);

                if (!string.IsNullOrEmpty(origin) && AllowedOrigins.Contains(origin))
                {
                    response.Headers.Add("Access-Control-Allow-Origin", origin);
                }

                response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                response.Headers.Add("Access-Control-Allow-Credentials", "true");

                if (request.Headers.Contains("Access-Control-Request-Headers"))
                {
                    var reqHeaders = string.Join(", ", request.Headers.GetValues("Access-Control-Request-Headers"));
                    response.Headers.Add("Access-Control-Allow-Headers", reqHeaders);
                }
                else
                {
                    response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization");
                }

                var tcs = new TaskCompletionSource<HttpResponseMessage>();
                tcs.SetResult(response);
                return tcs.Task;
            }

            return base.SendAsync(request, cancellationToken);
        }
    }
}
```

- Register it in `WebApiConfig.Register` before enabling CORS and routes:

```csharp
config.MessageHandlers.Add(new PreflightRequestsHandler());
var cors = new EnableCorsAttribute("http://localhost:4200", "Content-Type, Accept, Authorization", "GET,POST,PUT,DELETE,OPTIONS") { SupportsCredentials = true };
config.EnableCors(cors);
```

- If IIS rejects OPTIONS with 401.2 before ASP.NET runs, either enable Anonymous Authentication temporarily for OPTIONS or add a targeted URL Rewrite rule allowing anonymous for OPTIONS. After OPTIONS returns CORS headers, the actual POST/GET will still require Windows Authentication.

---

## Where paging and filtering logic lives in the frontend (exact files & what they do)

I inspected the current frontend code and extracted the exact locations and logic for paging and filtering so you can point developers to the right spots.

1) Users page
- File: `src/app/components/users/users.component.ts`
- Key properties used for paging and filtering:
  - Pagination:
    - `pageSize = 10` (items per page)
    - `currentPage = 1` (current page index)
    - `get totalPages()` — returns Math.ceil(filteredUsers.length / pageSize)
    - `get pagedUsers()` — slices the filtered list using `(currentPage - 1) * pageSize` and `slice(start, start + pageSize)` to return items for the current page
    - `goToPage(page: number)` — sets `currentPage` with bounds checking
    - `onFilterChange()` — called when filters/search change; resets `currentPage = 1`

  - Filters & search:
    - `statusFilter: 'all' | 'active' | 'inactive'` — default `'active'`
    - `departmentFilter: number | 'all'` — `'all'` default
    - `searchText: string` — free-text search
    - `get filteredUsers()` — returns `this.users.filter(...)` where each user is tested:
      - Status: checks `u.User.fcApprovalStatus` to interpret 'Approved' as active
      - Department: compares `u.User.fnDepartmentID` to `departmentFilter` when not 'all'
      - Search: concatenates relevant fields (`fnUserID`, `fcFirstName`, `fcLastName`, `fcUserEmail`, `fcUserNT`, department name, access desc) into a single lowercase string and checks `includes(searchText)`

- Where used in template: `pagedUsers` is rendered in the table; paging controls call `goToPage`; filter inputs call `onFilterChange()`.

2) Databases page
- File: `src/app/components/databases/databases.component.ts`
- Key properties used for paging and filtering:
  - Pagination:
    - `pageSize = 10`
    - `currentPage = 1`
    - `get totalPages()` — uses `filteredDatabases.length`
    - `get pagedDatabases()` — slices `filteredDatabases` for the page
    - `goToPage(page: number)` and `onFilterChange()` similar to Users

  - Filters:
    - `statusFilter: 'all' | 'active' | 'inactive'` — default `'active'`
    - `get filteredDatabases()` — filters by boolean `fnDatabaseActive` according to `statusFilter`

- Where used in template: `pagedDatabases` is used to render table rows; controls call `goToPage` and `onFilterChange`.

Notes on behavior & edge cases handled
- When filters/search change, code resets to page 1 to avoid empty page results.
- `totalPages` is clamped to at least 1 (Math.max(1, Math.ceil(...))) to avoid division-by-zero or zero-page UI.
- Search is case-insensitive and trims the search term.
- Page navigation bounds are checked in `goToPage` to remain within 1..totalPages.

If you want, I can also add a short README section with a code snippet that explains how to change `pageSize` or how to wire server-side pagination (if you prefer to move to server-side paging later).

---

## Next actions you asked for (and what I already did)

- You asked: "copy all to questions.md erase previous and commit and push to repo" — this file contains the requested entries and will be committed & pushed.
- You also asked: "last 3 to 4 questions conversations I needed also add where and what logic is used for paging and filtering in our code in questions.md and push it" — that is included above.

If you'd like changes to wording, or to include additional Q&A slices (older or newer), say which ones and I'll append them and push again.

---

End of document.
