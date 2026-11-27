import { z } from 'zod';

const ingredientSchema = z.object({
  name: z.string().min(1),
  dosage: z.number().positive(),
  unitMeasurement: z.string().min(1),
});

export const medicationSchema = z.object({
  id: z.number().int().positive(),
  medicationName: z.string().min(1),
  activeIngredient: z.array(ingredientSchema).min(1),
  category: z.string().min(1),
  presentationFormat: z.string().min(1),
  manufacturer: z.string().min(1),
  quantity: z.number().int(),
  status: z.string().min(1),
  createdAt: z.iso.datetime({ offset: true }),
  createdBy: z.string().min(1),
});

export const medicationPageSchema = z.object({
  content: z.array(medicationSchema),
  pageNumber: z.number().int(),
  pageSize: z.number().int(),
  totalElements: z.number().int(),
  totalPages: z.number().int(),
  lastPage: z.boolean(),
});

const optionSchema = z.object({ value: z.string().min(1), label: z.string().min(1) });

export const medicationOptionsSchema = z.object({
  units: z.array(optionSchema).min(1),
  categories: z.array(optionSchema).min(1),
  presentationFormats: z.array(optionSchema).min(1),
});

export type Medication = z.infer<typeof medicationSchema>;
