# Requirements Document

## Introduction

This module enables a "Google Chrome" application within the WebOS portfolio. The browser operates in Strict Whitelist Mode, proxying only specific approved URLs (e.g., the user's LinkedIn, GitHub, specific articles) to ensure security and relevance. It does not allow open browsing of the internet.

## Glossary

- **Browser_Service**: The backend Java service responsible for URL validation, content fetching, and HTML sanitization
- **Browser_Resource**: The JAX-RS REST endpoint exposing the proxy functionality
- **Chrome_App**: The React frontend component that renders the browser interface
- **Whitelist**: A predefined list of allowed URL prefixes that the proxy will serve
- **Reader_Mode**: The sanitized, transformed HTML output with scripts removed and URLs rewritten

## Requirements

### Requirement 1: URL Whitelist Validation

**User Story:** As a system administrator, I want to restrict browsable URLs to a predefined whitelist, so that visitors can only view approved content.

#### Acceptance Criteria

1. THE Browser_Service SHALL maintain a List<String> of allowed URL prefixes (e.g., ["https://github.com/my-user", "https://linkedin.com/in/my-user"])
2. WHEN a request is made for a URL, THE Browser_Service SHALL check if the URL starts with any allowed prefix
3. WHEN a request is made for a URL that does not start with an allowed prefix, THE Browser_Service SHALL throw a NotFoundException (HTTP 404)
4. THE Browser_Service SHALL NOT proxy any URL not explicitly whitelisted

### Requirement 2: Content Fetching

**User Story:** As a visitor, I want to view the author's external profiles (LinkedIn, GitHub) directly inside the OS window without dealing with iframe restrictions (X-Frame-Options).

#### Acceptance Criteria

1. WHEN a whitelisted URL is requested, THE Browser_Service SHALL use java.net.http.HttpClient to fetch the target URL
2. THE Browser_Service SHALL spoof the User-Agent header to appear as a standard desktop browser to avoid bot blocking
3. IF the external site is unreachable or returns an error, THEN THE Browser_Service SHALL return HTTP 502 (Bad Gateway)

### Requirement 3: HTML Sanitization

**User Story:** As a security-conscious developer, I want all fetched HTML to be sanitized, so that malicious scripts cannot execute in the browser.

#### Acceptance Criteria

1. THE Browser_Service SHALL use Jsoup to parse the raw HTML response
2. THE Browser_Service SHALL remove all `<script>` tags from the parsed HTML
3. THE Browser_Service SHALL remove all `<iframe>` tags from the parsed HTML
4. THE Browser_Service SHALL remove all `<object>` tags from the parsed HTML
5. THE Browser_Service SHALL remove all `<embed>` tags from the parsed HTML

### Requirement 4: URL Rewriting

**User Story:** As a visitor, I want images and resources to load correctly, so that the proxied page displays properly.

#### Acceptance Criteria

1. THE Browser_Service SHALL rewrite relative URLs to absolute URLs using the target URL as base
2. WHEN an HTML element contains a relative src attribute (e.g., `<img src="/avatar.png">`), THE Browser_Service SHALL convert it to an absolute URL (e.g., `<img src="https://github.com/avatar.png">`)
3. THE Browser_Service SHALL use Jsoup's setBaseUri method to handle URL resolution

### Requirement 5: Custom Styling Injection

**User Story:** As a visitor, I want the proxied content to be readable within the OS window, so that I have a pleasant viewing experience.

#### Acceptance Criteria

1. THE Browser_Service SHALL inject a custom `<style>` block into the sanitized HTML
2. THE injected styles SHALL ensure content fits within the OS window dimensions
3. THE injected styles SHALL handle overflow appropriately

### Requirement 6: Browser API Endpoint

**User Story:** As a frontend component, I want to request a rendered page via a simple URL parameter, so that I can display proxied content.

#### Acceptance Criteria

1. THE Browser_Resource SHALL expose a GET endpoint at `/browser/navigate`
2. THE endpoint SHALL accept a query parameter `url` containing the encoded target URL
3. WHEN the request succeeds, THE Browser_Resource SHALL return the cleaned HTML with Content-Type `text/html`
4. WHEN the URL is blocked or unknown, THE Browser_Resource SHALL return HTTP 404 with JSON response `{"error": "404 Not Found"}`
5. WHEN the external site fetch fails, THE Browser_Resource SHALL return HTTP 502 (Bad Gateway)

### Requirement 7: Chrome App Address Bar

**User Story:** As a visitor, I want to see the virtual URL in the address bar, so that I know which page I am viewing.

#### Acceptance Criteria

1. THE Chrome_App SHALL display an address bar input showing the virtual URL (e.g., `https://github.com/me`)
2. THE Chrome_App SHALL use the backend proxy URL as the actual iframe src attribute
3. WHEN a user types a URL and submits, THE Chrome_App SHALL update the iframe to load via the proxy

### Requirement 8: Bookmarks Display

**User Story:** As a visitor, I want to see a list of available bookmarks, so that I can easily navigate to allowed pages.

#### Acceptance Criteria

1. THE Chrome_App SHALL display a visible list of bookmarks representing the whitelisted URLs
2. WHEN a user clicks a bookmark, THE Chrome_App SHALL navigate to that URL via the proxy
3. THE bookmarks SHALL be easily accessible within the browser interface

### Requirement 9: Navigation Error Handling

**User Story:** As a visitor, I want to see appropriate error messages when navigation fails, so that I understand why a page cannot be displayed.

#### Acceptance Criteria

1. WHEN a user attempts to navigate to a blocked URL, THE Chrome_App SHALL display the backend's 404 error page in the iframe
2. WHEN a fetch error occurs, THE Chrome_App SHALL display the backend's 502 error response
