package com.thesystem.util;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

class TimezoneUtilsTest {

    @Test
    void getCurrentDateInTimezone_returnsNonNull() {
        LocalDate date = TimezoneUtils.getCurrentDateInTimezone("Asia/Kolkata");
        Assertions.assertNotNull(date);
    }

    @Test
    void getCurrentDateInTimezone_returnsNonNullForUTC() {
        LocalDate date = TimezoneUtils.getCurrentDateInTimezone("UTC");
        Assertions.assertNotNull(date);
    }

    @Test
    void getCurrentDateInTimezone_returnsNonNullForNewYork() {
        LocalDate date = TimezoneUtils.getCurrentDateInTimezone("America/New_York");
        Assertions.assertNotNull(date);
    }
}
