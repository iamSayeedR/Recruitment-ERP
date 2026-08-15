"use client";
import { RequisitionDetail } from '@/features/requisitions/RequisitionDetail';

export default function RequisitionDetailPage({ params }: { params: { id: string } }) {
  return <RequisitionDetail id={params.id} />;
}
