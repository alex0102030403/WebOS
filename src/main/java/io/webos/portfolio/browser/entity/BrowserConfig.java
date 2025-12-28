package io.webos.portfolio.browser.entity;

import java.util.List;

/**
 * Configuration for the browser proxy subsystem.
 * Contains whitelist of allowed URL prefixes, user-agent for requests,
 * and custom styles to inject into proxied content.
 */
public record BrowserConfig(
    List<String> allowedPrefixes,
    String userAgent,
    String customStyles
) {
    
    public static BrowserConfig defaults() {
        return new BrowserConfig(
            List.of(
                "https://github.com/",
                "https://linkedin.com/in/",
                "https://www.linkedin.com/in/",
                "https://medium.com/@"
            ),
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            """
            body { max-width: 100%; overflow-x: hidden; }
            img { max-width: 100%; height: auto; }
            pre { overflow-x: auto; }
            """
        );
    }
}
