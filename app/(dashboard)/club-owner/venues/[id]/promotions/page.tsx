"use client";

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { getPromotionsForVenue, createPromotion } from '@/lib/actions/promotions';
import { PromotionsTable } from '@/components/promotions/promotions-table';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PromotionForm } from '@/components/promotions/promotion-form';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function PromotionsPage({ params, promotions: initialPromotions, error }: { params: { id: string }, promotions: any[], error: string | null }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });

    const result = await createPromotion(params.id, formData);

    if (result.success) {
      toast.success("Promotion created successfully!");
      setIsModalOpen(false);
      router.refresh(); // Refresh the page to show the new promotion
    } else {
      toast.error(result.error || "Failed to create promotion.");
    }
    setIsSubmitting(false);
  };

  if (error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p className="text-muted-foreground mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Manage Promotions</h1>
          <p className="text-muted-foreground mt-2">
            Create, edit, and manage promotions for your venue.
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Promotion
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Promotion</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <PromotionForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <PromotionsTable promotions={initialPromotions || []} />
      </Suspense>
    </div>
  );
} 