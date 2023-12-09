'use server';

import { sql } from "@vercel/postgres";
import { z } from "zod";
import { revalidatePath } from 'next/cache';
import { redirect } from "next/navigation";
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const FormSchema = z.object({
    id:z.string({

      invalid_type_error:'please select a customer'
    }),
    customerId: z.string(),
    amount: z.coerce
      .number()
      .gt(0, {
        message: 'Please enter amount greater than $0.'
      }),
    status: z.enum(['pending', 'paid'],{
      invalid_type_error: 'please select an invoice status.'
    }),
    date: z.string()
})

const CreateInvoice = FormSchema.omit({id:true, date:true})

export type State = {
  errors?:{
    customerId?: string[],
    amount?:string[],
    status?:string[],
  };
  message?: string | null
}


export async function createInvoice(prevState: State, formData: FormData){
    
    // get data from formData
    // const rawFormData = {
    //     customerId: formData.get('customerId'),
    //     amount: formData.get('amount'),
    //     status: formData.get('status')
    // };

    // when you has an form whit many entries
    // const rawFormData = Object.fromEntries(formData.entries())


    // whit zod
    const validatedFormFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status')
    })
    if (!validatedFormFields.success) {
      return {
        errors: validatedFormFields.error.flatten().fieldErrors,
        message: 'Mising Fields. Failed to Create Invoice'
      }
    }

    const { amount, customerId, status } = validatedFormFields.data

    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0]

    try {
      await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
      `;
  
      revalidatePath('/dashboard/invoices');
      
    } catch (error) {
      return {
        message: 'Database Error: Failed to create invoice',
      };  
    }
    redirect('/dashboard/invoices')
}

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
 
// ...
 
export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  const amountInCents = amount * 100;
 
  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
   
    revalidatePath('/dashboard/invoices');
    
  } catch (error) {
    return {
      message: `We can't update the invoice ${id}, problem occured`
    }  
  }
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  throw new Error('Failed to Delete Invoice');
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return {
      message: `The invoce ${id }, was removed`
    }    
  } catch (error) {
    return {
      message: `We can't remove the invoce ${id }, problem occured`
    }    
  }
  }

  export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
  ) {
    try {
      await signIn('credentials', formData);
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case 'CredentialsSignin':
            return 'Invalid credentials.';
          default:
            return 'Something went wrong.';
        }
      }
      throw error;
    }
  }