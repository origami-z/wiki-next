/**
 * Entity List Page
 * Displays a list of entities for a specific game and entity type
 */

import { getEntitySchema } from '@/lib/admin/schemas/wittle-defender';
import { EntityList } from '@/components/admin/EntityList';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    locale: string;
    gameSlug: string;
    entityType: string;
  }>;
}

export default async function EntityListPage({ params }: PageProps) {
  const { gameSlug, entityType } = await params;

  // Get schema for this entity type
  const schema = getEntitySchema(gameSlug, entityType);

  if (!schema) {
    notFound();
  }

  return <EntityList gameSlug={gameSlug} entityType={entityType} schema={schema} />;
}
