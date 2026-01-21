/**
 * Edit Entity Page
 * Form for editing an existing entity
 */

import { getEntitySchema } from '@/lib/admin/schemas/wittle-defender';
import { getEntityById } from '@/lib/admin/file-operations';
import { EntityForm } from '@/components/admin/EntityForm';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    locale: string;
    gameSlug: string;
    entityType: string;
    entityId: string;
  }>;
}

export default async function EditEntityPage({ params }: PageProps) {
  const { gameSlug, entityType, entityId } = await params;

  // Get schema for this entity type
  const schema = getEntitySchema(gameSlug, entityType);

  if (!schema) {
    notFound();
  }

  // Load entity data
  const entity = await getEntityById(gameSlug, entityType, entityId);

  if (!entity) {
    notFound();
  }

  return (
    <EntityForm
      gameSlug={gameSlug}
      entityType={entityType}
      schema={schema}
      entityId={entityId}
      initialData={entity}
      mode="edit"
    />
  );
}
