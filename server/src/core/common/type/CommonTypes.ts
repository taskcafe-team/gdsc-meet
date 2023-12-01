export type Nullable<T> = T | null;
// export type Optional<T> = T | undefined;
export type OmitBaseEntity<T> = Omit<
  T,
  "id" | "createdAt" | "updatedAt" | "removedAt"
>;
