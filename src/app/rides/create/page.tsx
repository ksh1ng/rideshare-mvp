'use client';

import { useForm } from 'react-hook-form';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function CreateRidePage() {
  const supabase = createClient();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return alert('Please login');

    const { error } = await supabase
      .from('rides')
      .insert({
        ...data,
        user_id: user.id,
        status: 'OPEN'
      });

    if (!error) {
      router.push('/rides');
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-8">
      {/* Example Input with Register */}
      <input
        {...register("origin", { required: true })}
        placeholder="Origin"
        className="w-full p-3 border rounded"
      />
      {/* ... rest of form ... */}
    </form>
  );
}
