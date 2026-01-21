/**
 * Create New Entity Page
 * Form for creating a new entity
 */

import { getEntitySchema } from '@/lib/admin/schemas/wittle-defender';
import { EntityForm } from '@/components/admin/EntityForm';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    locale: string;
    gameSlug: string;
    entityType: string;
  }>;
}

export default async function NewEntityPage({ params }: PageProps) {
  const { gameSlug, entityType } = await params;

  // Get schema for this entity type
  const schema = getEntitySchema(gameSlug, entityType);

  if (!schema) {
    notFound();
  }

  return (
    <EntityForm
      gameSlug={gameSlug}
      entityType={entityType}
      schema={schema}
      mode="create"
    />
  );
}
