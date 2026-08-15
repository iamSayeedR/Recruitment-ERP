package com.recruitmenterp.common.crypto;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.time.LocalDate;
import org.springframework.stereotype.Component;

@Component
@Converter
public class LocalDateEncryptionConverter implements AttributeConverter<LocalDate, String> {

    private final FieldEncryptionConverter fieldEncryptionConverter = new FieldEncryptionConverter();

    @Override
    public String convertToDatabaseColumn(LocalDate attribute) {
        if (attribute == null) return null;
        return fieldEncryptionConverter.convertToDatabaseColumn(attribute.toString());
    }

    @Override
    public LocalDate convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        String decrypted = fieldEncryptionConverter.convertToEntityAttribute(dbData);
        return LocalDate.parse(decrypted);
    }
}
