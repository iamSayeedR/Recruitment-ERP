"use client";
import { CandidatePipeline } from '@/features/candidates/CandidatePipeline';

export default function PipelinePage({ params }: { params: { id: string } }) {
  return <CandidatePipeline requisitionId={params.id} />;
}
