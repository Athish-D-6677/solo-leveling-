package com.thesystem.util;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;

public class TimezoneUtils {

    private TimezoneUtils() {
        // Utility class
    }

    /**
     * Returns the current date in the given timezone.
     *
     * @param timezone IANA timezone string, e.g. "Asia/Kolkata"
     * @return LocalDate in that timezone
     */
    public static LocalDate getCurrentDateInTimezone(String timezone) {
        ZoneId zoneId = ZoneId.of(timezone);
        return ZonedDateTime.now(zoneId).toLocalDate();
    }
}
