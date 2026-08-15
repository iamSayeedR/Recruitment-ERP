import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { Select } from '@/ui/Select';
import { Textarea } from '@/ui/Textarea';
import { useCreateRequisition } from '@/hooks/useRequisitions';
import { useRouter } from 'next/navigation';
import styles from './RequisitionWizard.module.css';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['BLUE_COLLAR', 'WHITE_COLLAR', 'EXECUTIVE']),
  country: z.string().min(1, 'Country is required'),
  headcount: z.coerce.number().min(1, 'Headcount must be at least 1'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  salaryRange: z.string().optional(),
  benefits: z.string().optional(),
  contractDuration: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  requirements: z.string().optional(),
});

export const RequisitionWizard: React.FC = () => {
  const router = useRouter();
  const { mutate, isPending, error: apiError } = useCreateRequisition();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      category: 'WHITE_COLLAR',
      priority: 'MEDIUM',
      headcount: 1,
      country: 'Saudi Arabia',
    }
  });

  const onSubmit = (data: any) => {
    // Map frontend form values to backend CreateRequisitionRequest schema
    const payload = {
      title: data.title,
      description: data.description,
      jobCategory: data.category === 'EXECUTIVE' ? 'WHITE_COLLAR' : data.category,
      destinationCountry: data.country || data.location || 'Saudi Arabia',
      positionsRequired: Number(data.headcount) || 1,
      priority: data.priority || 'MEDIUM',
      salaryRange: data.salaryRange || '',
      benefits: data.benefits || '',
      contractDuration: Number(data.contractDuration) || 12,
      requiredSkills: data.requirements || '',
    };

    mutate(payload as any, {
      onSuccess: () => {
        router.push('/requisitions');
      }
    });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Create New Requisition</h2>
      
      {apiError && (
        <div style={{ padding: '0.75rem 1rem', background: '#FEE2E2', color: '#991B1B', borderRadius: '0.5rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
          Failed to create requisition. Please verify all required fields.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.grid}>
          <div className={styles.field}>
            <label>Job Title *</label>
            <Input {...register('title')} placeholder="e.g. Senior DevOps Engineer" />
            {errors.title && <span className={styles.error}>{errors.title.message?.toString()}</span>}
          </div>
          <div className={styles.field}>
            <label>Department</label>
            <Input {...register('department')} placeholder="e.g. Engineering" />
          </div>
          <div className={styles.field}>
            <label>Job Category *</label>
            <Select {...register('category')} options={[
              { label: 'White Collar', value: 'WHITE_COLLAR' },
              { label: 'Blue Collar', value: 'BLUE_COLLAR' },
              { label: 'Executive', value: 'EXECUTIVE' }
            ]} />
          </div>
          <div className={styles.field}>
            <label>Priority *</label>
            <Select {...register('priority')} options={[
              { label: 'Low', value: 'LOW' },
              { label: 'Medium', value: 'MEDIUM' },
              { label: 'High', value: 'HIGH' },
              { label: 'Urgent', value: 'URGENT' }
            ]} />
          </div>
          <div className={styles.field}>
            <label>Destination Country *</label>
            <Input {...register('country')} placeholder="e.g. Saudi Arabia" />
            {errors.country && <span className={styles.error}>{errors.country.message?.toString()}</span>}
          </div>
          <div className={styles.field}>
            <label>Location / City</label>
            <Input {...register('location')} placeholder="e.g. Riyadh" />
          </div>
          <div className={styles.field}>
            <label>Positions Required (Headcount) *</label>
            <Input type="number" {...register('headcount')} min={1} />
            {errors.headcount && <span className={styles.error}>{errors.headcount.message?.toString()}</span>}
          </div>
          <div className={styles.field}>
            <label>Salary Range</label>
            <Input {...register('salaryRange')} placeholder="e.g. $6,000 - $8,000 / month" />
          </div>
        </div>

        <div className={styles.field}>
          <label>Job Description *</label>
          <Textarea rows={4} {...register('description')} placeholder="Provide role responsibilities and details..." />
          {errors.description && <span className={styles.error}>{errors.description.message?.toString()}</span>}
        </div>

        <div className={styles.field}>
          <label>Required Skills & Qualifications</label>
          <Textarea rows={3} {...register('requirements')} placeholder="e.g. Docker, Kubernetes, Terraform, AWS" />
        </div>

        <div className={styles.actions}>
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={isPending}>{isPending ? 'Saving...' : 'Create Requisition'}</Button>
        </div>
      </form>
    </div>
  );
};
