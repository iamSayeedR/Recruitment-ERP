"use client";
import { CandidateProfile } from '@/features/candidates/CandidateProfile';

export default function CandidateProfilePage({ params }: { params: { id: string } }) {
  return <CandidateProfile id={params.id} />;
}
