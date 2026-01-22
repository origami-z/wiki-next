/**
 * Entity List Component
 * Displays a searchable, sortable list of entities
 */

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { EntitySchema } from "@/types/admin";
import styles from "./EntityList.module.css";

// ... props interface
interface EntityListProps {
  gameSlug: string;
  entityType: string;
  schema: EntitySchema;
  initialEntities?: any[];
}

export function EntityList({
  gameSlug,
  entityType,
  schema,
  initialEntities = [],
}: EntityListProps) {
  const [entities, setEntities] = useState<any[]>(initialEntities);
  const [loading, setLoading] = useState(initialEntities.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState(schema.sortField || schema.displayField);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    schema.sortOrder || "asc",
  );

  const isFirstRun = useRef(true);
  
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      if (initialEntities.length > 0) return;
    }
    loadEntities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameSlug, entityType, searchQuery, sortBy, sortOrder]);

  async function loadEntities() {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (sortBy) params.append("sortBy", sortBy);
      if (sortOrder) params.append("sortOrder", sortOrder);

      console.log("EntityList fetching with params:", params.toString());
      const response = await fetch(
        `/api/admin/${gameSlug}/${entityType}?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error("Failed to load entities");
      }

      const data = await response.json();
      setEntities(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(entityId: string) {
    if (!confirm("Are you sure you want to delete this entity?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/${gameSlug}/${entityType}?id=${entityId}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        throw new Error("Failed to delete entity");
      }

      // Reload entities
      await loadEntities();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete entity");
    }
  }

  function handleSort(field: string) {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  }

  if (loading && entities.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>{schema.pluralLabel}</h1>
          <Link
            href={`/admin/${gameSlug}/${entityType}/new`}
            className={styles.createButton}
          >
            + Create New {schema.label}
          </Link>
        </div>

        <div className={styles.toolbar}>
          <input
            type="search"
            placeholder={`Search ${schema.pluralLabel.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />

          <div className={styles.stats}>
            {entities.length} {entities.length === 1 ? "item" : "items"}
          </div>
        </div>
      </div>

      {entities.length === 0 ? (
        <div className={styles.empty}>
          <p>No {schema.pluralLabel.toLowerCase()} found.</p>
          <Link
            href={`/admin/${gameSlug}/${entityType}/new`}
            className={styles.createButton}
          >
            Create your first {schema.label.toLowerCase()}
          </Link>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th onClick={() => handleSort(schema.displayField)}>
                  <div className={styles.headerCell}>
                    {schema.label}
                    {sortBy === schema.displayField && (
                      <span className={styles.sortIcon}>
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th onClick={() => handleSort("id")}>
                  <div className={styles.headerCell}>
                    ID
                    {sortBy === "id" && (
                      <span className={styles.sortIcon}>
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                {schema.fields
                  .filter(
                    (f) =>
                      f.name !== schema.displayField &&
                      f.name !== "id" &&
                      f.name !== "slug" &&
                      f.name !== "description" &&
                      (f.type === "string" || f.type === "select"),
                  )
                  .slice(0, 3)
                  .map((field) => (
                    <th key={field.name} onClick={() => handleSort(field.name)}>
                      <div className={styles.headerCell}>
                        {field.label}
                        {sortBy === field.name && (
                          <span className={styles.sortIcon}>
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                <th className={styles.actionsHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entities.map((entity) => (
                <tr key={entity.id}>
                  <td className={styles.nameCell}>
                    {entity[schema.displayField]}
                  </td>
                  <td className={styles.idCell}>{entity.id}</td>
                  {schema.fields
                    .filter(
                      (f) =>
                        f.name !== schema.displayField &&
                        f.name !== "id" &&
                        f.name !== "slug" &&
                        f.name !== "description" &&
                        (f.type === "string" || f.type === "select"),
                    )
                    .slice(0, 3)
                    .map((field) => (
                      <td key={field.name}>{entity[field.name] || "-"}</td>
                    ))}
                  <td className={styles.actionsCell}>
                    <Link
                      href={`/admin/${gameSlug}/${entityType}/${entity.id}`}
                      className={styles.editButton}
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(entity.id)}
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
