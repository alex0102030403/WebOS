package io.webos.portfolio.browser.control;

import io.webos.portfolio.browser.entity.BrowserConfig;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.NotFoundException;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Service for proxying and sanitizing external web content.
 * Validates URLs against a whitelist, fetches content, removes dangerous tags,
 * rewrites relative URLs, and injects custom styles.
 */
@ApplicationScoped
public class BrowserService {

    private static final System.Logger LOGGER = System.getLogger(BrowserService.class.getName());

    BrowserConfig config = BrowserConfig.defaults();
    HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

    /**
     * Validates if a URL is allowed based on the configured whitelist prefixes.
     * 
     * @param url the URL to validate
     * @return true if the URL starts with any allowed prefix, false otherwise
     */
    public boolean isAllowed(String url) {
        if (url == null || url.isBlank()) {
            return false;
        }
        return this.config.allowedPrefixes().stream()
                .anyMatch(url::startsWith);
    }

    /**
     * Removes dangerous HTML tags that could execute scripts or embed external content.
     * Removes: script, iframe, object, embed tags.
     * 
     * @param document the Jsoup document to sanitize
     * @return the sanitized document
     */
    public Document removeDangerousTags(Document document) {
        document.select("script, iframe, object, embed").remove();
        return document;
    }

    /**
     * Rewrites relative URLs to absolute URLs using the base URL.
     * Converts src, href, and action attributes from relative to absolute.
     * 
     * @param document the Jsoup document to process
     * @param baseUrl the base URL for resolving relative URLs
     * @return the document with absolute URLs
     */
    public Document rewriteRelativeUrls(Document document, String baseUrl) {
        document.setBaseUri(baseUrl);
        
        document.select("[src]").forEach(element -> 
            element.attr("src", element.absUrl("src")));
        
        document.select("[href]").forEach(element -> 
            element.attr("href", element.absUrl("href")));
        
        document.select("[action]").forEach(element -> 
            element.attr("action", element.absUrl("action")));
        
        return document;
    }

    /**
     * Injects custom styles into the document head.
     * Creates a head element if one doesn't exist.
     * 
     * @param document the Jsoup document to modify
     * @return the document with injected styles
     */
    public Document injectStyles(Document document) {
        Element head = document.head();
        if (head == null) {
            head = document.appendElement("head");
        }
        
        Element styleElement = head.appendElement("style");
        styleElement.attr("type", "text/css");
        styleElement.text(this.config.customStyles());
        
        return document;
    }

    /**
     * Fetches HTML content from the specified URL using HttpClient.
     * Uses a spoofed User-Agent header to avoid bot blocking.
     * 
     * @param url the URL to fetch content from
     * @return the raw HTML content as a string
     * @throws BadGatewayException if the fetch fails or returns an error status
     */
    public String fetchContent(String url) {
        try {
            var request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("User-Agent", this.config.userAgent())
                    .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                    .timeout(Duration.ofSeconds(30))
                    .GET()
                    .build();

            var response = this.httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() >= 400) {
                LOGGER.log(System.Logger.Level.WARNING, "External site returned error: {0} for URL: {1}", 
                        response.statusCode(), url);
                throw new BadGatewayException("External site returned error: " + response.statusCode());
            }
            
            return response.body();
        } catch (IOException | InterruptedException e) {
            LOGGER.log(System.Logger.Level.ERROR, "Failed to fetch content from: {0}", url, e);
            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            throw new BadGatewayException("Failed to fetch content: " + e.getMessage());
        }
    }

    /**
     * Fetches content from a whitelisted URL, sanitizes it, and returns the processed HTML.
     * Orchestrates validation, fetching, sanitization, URL rewriting, and style injection.
     * 
     * @param url the target URL to proxy
     * @return sanitized HTML content ready for display
     * @throws NotFoundException if the URL is not in the whitelist
     * @throws BadGatewayException if the external fetch fails
     */
    public String fetchAndSanitize(String url) {
        if (!isAllowed(url)) {
            LOGGER.log(System.Logger.Level.INFO, "Blocked URL not in whitelist: {0}", url);
            throw new NotFoundException("URL not allowed: " + url);
        }

        var rawHtml = fetchContent(url);
        var document = Jsoup.parse(rawHtml);
        
        removeDangerousTags(document);
        rewriteRelativeUrls(document, url);
        injectStyles(document);
        
        return document.html();
    }
}
