import { z, ZodTypeAny } from 'zod';

export function generateZodSchema(fields: any[]): ZodTypeAny {
    const schema: Record<string, ZodTypeAny> = {};

    fields.forEach(field => {
        switch (field.type) {
            case 'text':
            case 'email':
            case 'password':
                schema[field.name] = z.string()
                    .min(field.validation?.minLength || 0, field.validation?.errorMessage)
                    .max(field.validation?.maxLength || Infinity, field.validation?.errorMessage)
                    .regex(new RegExp(field.validation?.pattern || '.*'), field.validation?.errorMessage);
                break;
            case 'select':
                schema[field.name] = z.enum(field.options.map((option: any) => option.value));
                break;
            case 'checkbox':
                schema[field.name] = z.boolean().refine(val => val === true, field.validation?.errorMessage);
                break;
            case 'radio':
                schema[field.name] = z.enum(field.options.map((option: any) => option.value));
                break;
            case 'file':
                schema[field.name] = z.any().optional(); // Adjust based on file handling
                break;
            default:
                break;
        }
    });
    console.log(schema)
    return z.object(schema);
}