import {z} from 'zod';


export const createOrganizationSchema = z.object({
  name: z.string()
    .min(2,"Name must be atleast 2 characters")
    .max(100, "Name is to long"),
  description: z.string()
    .max(500,"Description to long")
    .optional(),
  logoUrl: z.string()
    .url('Must be valid url')
    .optional()
});

export const updateOrganizationSchema = z.object({
  name: z.string()
    .min(2,"Name must be atleast 2 characters")
    .max(100, "Name is to long")
    .optional(),
  description: z.string()
    .max(500,"Description to long")
    .optional(),
  logoUrl: z.string()
    .url('Must be valid url')
    .optional()
})




export type createOrganizationDto = z.infer<typeof createOrganizationSchema>;
export type updateOrganizationDto = z.infer<typeof updateOrganizationSchema>;