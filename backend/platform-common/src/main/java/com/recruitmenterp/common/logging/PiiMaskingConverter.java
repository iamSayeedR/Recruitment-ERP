package com.recruitmenterp.common.logging;

import ch.qos.logback.classic.pattern.ClassicConverter;
import ch.qos.logback.classic.spi.ILoggingEvent;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class PiiMaskingConverter extends ClassicConverter {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("(?<=.{2}).(?=[^@]*?@)");
    private static final Pattern PHONE_PATTERN = Pattern.compile("\\b(\\d{3})\\d{4}(\\d{4})\\b"); // Masking middle digits for phone
    private static final Pattern PASSPORT_PATTERN = Pattern.compile("\\b[A-Z][0-9]{7,8}\\b");
    private static final Pattern NATIONAL_ID_PATTERN = Pattern.compile("\\b\\d{10,12}\\b");

    @Override
    public String convert(ILoggingEvent event) {
        String message = event.getFormattedMessage();
        if (message == null) {
            return null;
        }
        
        message = maskEmail(message);
        message = maskPhone(message);
        message = maskPassport(message);
        message = maskNationalId(message);
        
        return message;
    }

    private String maskEmail(String message) {
        Matcher matcher = EMAIL_PATTERN.matcher(message);
        return matcher.replaceAll("*");
    }

    private String maskPhone(String message) {
        Matcher matcher = PHONE_PATTERN.matcher(message);
        return matcher.replaceAll("$1****$2");
    }

    private String maskPassport(String message) {
        Matcher matcher = PASSPORT_PATTERN.matcher(message);
        return matcher.replaceAll(m -> m.group().substring(0, 2) + "****");
    }

    private String maskNationalId(String message) {
        Matcher matcher = NATIONAL_ID_PATTERN.matcher(message);
        return matcher.replaceAll("********");
    }
}
