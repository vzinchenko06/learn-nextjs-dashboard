'use server'
import { z } from 'zod'
import { sql } from '@vercel/postgres'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { signIn } from '@/auth'

export async function authenticate (
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', Object.fromEntries(formData))
  } catch (error) {
    if ((error as Error).message.includes('CredentialsSignin')) {
      return 'InvalidCredential'
    }
    throw error
  }
}

// This is temporary until @types/react-dom is updated
export type InvoiceFormState = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

const InvoiceFormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    required_error: 'Please select a customer.',
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce.number().
    gt(0, { message: 'Please enter an amount greater than $0.' }).
    transform((amount) => amount * 100),
  status: z.enum(['pending', 'paid'], {
    required_error: 'Please select an invoice status.',
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
})

const CreateInvoiceSchema = InvoiceFormSchema.omit({ id: true, date: true })
const UpdateInvoiceSchema = InvoiceFormSchema.omit({ id: true, date: true })

export async function createInvoice (
  prevState: InvoiceFormState, formData: FormData) {
  console.log('-> createInvoice', Object.fromEntries(formData))

  const validatedFields = CreateInvoiceSchema.safeParse(
    Object.fromEntries(formData.entries()))

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    }
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data
  const date = new Date().toISOString().split('T')[0]

  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amount}, ${status}, ${date})
    `
  } catch (err) {
    console.error('Create Invoice Error:', err)

    return {
      message: 'Database Error: Failed to Create Invoice.',
    }
  }

  revalidatePath('/dashboard/invoices')
  redirect('/dashboard/invoices')
}

export async function updateInvoice (
  id: string, prevState: InvoiceFormState, formData: FormData) {
  console.log('-> updateInvoice', id, Object.fromEntries(formData))

  const validatedFields = UpdateInvoiceSchema.safeParse(
    Object.fromEntries(formData.entries()))

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    }
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data

  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amount}, status = ${status}
      WHERE id = ${id}
    `
  } catch (err) {
    console.error('Update Invoice Error:', err)
    return { message: 'Database Error: Failed to Update Invoice.' }
  }

  revalidatePath('/dashboard/invoices')
  redirect('/dashboard/invoices')
}

export async function deleteInvoice (id: string, formData: FormData) {
  console.log('-> deleteInvoice', id, Object.fromEntries(formData))

  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`
  } catch (err) {
    console.error('Delete Invoice Error:', err)
    return { message: 'Database Error: Failed to Delete Invoice.' }
  }

  revalidatePath('/dashboard/invoices')
}
