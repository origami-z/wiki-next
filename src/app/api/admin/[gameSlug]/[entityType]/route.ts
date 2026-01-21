/**
 * Admin API Route
 * Handles CRUD operations for game entities
 * Only accessible in development mode
 */

import { NextRequest, NextResponse } from 'next/server';
import { getEntitySchema } from '@/lib/admin/schemas/wittle-defender';
import { validateEntity } from '@/lib/admin/validation';
import {
  readEntityData,
  createEntity,
  updateEntity,
  deleteEntity,
  searchEntities,
  sortEntities,
  isAdminEnabled,
} from '@/lib/admin/file-operations';
import type { ApiResponse } from '@/types/admin';

/**
 * Check if admin mode is enabled
 */
function checkAdminAccess(): NextResponse | null {
  if (!isAdminEnabled()) {
    return NextResponse.json(
      {
        success: false,
        error: 'Admin access is only available in development mode',
      } as ApiResponse,
      { status: 404 }
    );
  }
  return null;
}

/**
 * GET - List all entities or get a single entity by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameSlug: string; entityType: string }> }
): Promise<NextResponse> {
  // Check admin access
  const accessCheck = checkAdminAccess();
  if (accessCheck) return accessCheck;

  try {
    const { gameSlug, entityType } = await params;
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('id');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy');
    const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';

    // Get entity schema
    const schema = getEntitySchema(gameSlug, entityType);
    if (!schema) {
      return NextResponse.json(
        {
          success: false,
          error: `Schema not found for ${gameSlug}/${entityType}`,
        } as ApiResponse,
        { status: 404 }
      );
    }

    // Read entity data
    let data = await readEntityData(gameSlug, entityType);

    // If requesting a single entity
    if (entityId) {
      const entity = data.find((e) => e.id === entityId);
      if (!entity) {
        return NextResponse.json(
          {
            success: false,
            error: `Entity with ID ${entityId} not found`,
          } as ApiResponse,
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: entity,
      } as ApiResponse);
    }

    // Search if query provided
    if (search) {
      data = await searchEntities(
        gameSlug,
        entityType,
        search,
        schema.searchFields || [schema.displayField]
      );
    }

    // Sort if requested
    if (sortBy) {
      data = sortEntities(data, sortBy, sortOrder);
    } else if (schema.sortField) {
      data = sortEntities(data, schema.sortField, schema.sortOrder || 'asc');
    }

    return NextResponse.json({
      success: true,
      data,
    } as ApiResponse);
  } catch (error) {
    console.error('Admin API GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve entities',
      } as ApiResponse,
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new entity
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameSlug: string; entityType: string }> }
): Promise<NextResponse> {
  // Check admin access
  const accessCheck = checkAdminAccess();
  if (accessCheck) return accessCheck;

  try {
    const { gameSlug, entityType } = await params;
    const body = await request.json();

    // Get entity schema
    const schema = getEntitySchema(gameSlug, entityType);
    if (!schema) {
      return NextResponse.json(
        {
          success: false,
          error: `Schema not found for ${gameSlug}/${entityType}`,
        } as ApiResponse,
        { status: 404 }
      );
    }

    // Validate entity data
    const errors = validateEntity(schema, body);
    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          errors,
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Create entity
    await createEntity(gameSlug, entityType, body);

    return NextResponse.json({
      success: true,
      data: body,
    } as ApiResponse);
  } catch (error) {
    console.error('Admin API POST error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create entity';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      } as ApiResponse,
      { status: 400 }
    );
  }
}

/**
 * PUT - Update an existing entity
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ gameSlug: string; entityType: string }> }
): Promise<NextResponse> {
  // Check admin access
  const accessCheck = checkAdminAccess();
  if (accessCheck) return accessCheck;

  try {
    const { gameSlug, entityType } = await params;
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('id');

    if (!entityId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Entity ID is required',
        } as ApiResponse,
        { status: 400 }
      );
    }

    const body = await request.json();

    // Get entity schema
    const schema = getEntitySchema(gameSlug, entityType);
    if (!schema) {
      return NextResponse.json(
        {
          success: false,
          error: `Schema not found for ${gameSlug}/${entityType}`,
        } as ApiResponse,
        { status: 404 }
      );
    }

    // Validate entity data
    const errors = validateEntity(schema, body);
    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          errors,
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Update entity
    await updateEntity(gameSlug, entityType, entityId, body);

    return NextResponse.json({
      success: true,
      data: body,
    } as ApiResponse);
  } catch (error) {
    console.error('Admin API PUT error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to update entity';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      } as ApiResponse,
      { status: 400 }
    );
  }
}

/**
 * DELETE - Delete an entity
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ gameSlug: string; entityType: string }> }
): Promise<NextResponse> {
  // Check admin access
  const accessCheck = checkAdminAccess();
  if (accessCheck) return accessCheck;

  try {
    const { gameSlug, entityType } = await params;
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('id');

    if (!entityId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Entity ID is required',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Delete entity
    await deleteEntity(gameSlug, entityType, entityId);

    return NextResponse.json({
      success: true,
      data: { id: entityId },
    } as ApiResponse);
  } catch (error) {
    console.error('Admin API DELETE error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to delete entity';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      } as ApiResponse,
      { status: 404 }
    );
  }
}
