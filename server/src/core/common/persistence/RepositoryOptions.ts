export type RepositoryFindOptions = {
  includeRemoved?: boolean;
  limit?: number | undefined;
  offset?: number;
};

export type RepositoryUpdateManyOptions = {
  includeRemoved?: boolean;
};

export type RepositoryRemoveOptions = {
  disableSoftDeleting?: boolean;
};
