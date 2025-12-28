package io.webos.portfolio.boot.control;

import io.webos.portfolio.boot.entity.BootConfig;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

/**
 * Provides boot configuration for the WebOS system.
 * Reads values from MicroProfile Config with sensible defaults.
 */
@ApplicationScoped
public class BootService {

    @ConfigProperty(name = "webos.version", defaultValue = "1.0.0")
    String osVersion;

    @ConfigProperty(name = "webos.theme", defaultValue = "dark")
    String theme;

    @ConfigProperty(name = "webos.wallpaper.url", defaultValue = "/assets/wallpaper.jpg")
    String wallpaperUrl;

    /**
     * Returns the boot configuration.
     * Username is always "Visitor" regardless of configuration.
     */
    public BootConfig bootConfig() {
        return new BootConfig(
            this.osVersion,
            this.theme,
            this.wallpaperUrl,
            "Visitor"
        );
    }
}
