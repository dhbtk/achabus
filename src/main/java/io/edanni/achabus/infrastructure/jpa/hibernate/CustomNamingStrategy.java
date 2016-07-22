package io.edanni.achabus.infrastructure.jpa.hibernate;

import org.hibernate.cfg.ImprovedNamingStrategy;

/**
 * Created by eduardo on 22/07/16.
 */
public class CustomNamingStrategy extends ImprovedNamingStrategy
{
    private static final String PLURAL_SUFFIX = "s";

    /**
     * Transforms class names to table names by using the described naming conventions.
     * @param className
     * @return  The constructed table name.
     */
    @Override
    public String classToTableName(String className) {
        String tableNameInSingularForm = super.classToTableName(className);
        return transformToPluralForm(tableNameInSingularForm);
    }

    private String transformToPluralForm(String tableNameInSingularForm) {
        StringBuilder pluralForm = new StringBuilder();

        pluralForm.append(tableNameInSingularForm);
        pluralForm.append(PLURAL_SUFFIX);

        return pluralForm.toString();
    }
}
