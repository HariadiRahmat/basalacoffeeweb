/** Branch id for legacy rows without branch_id (counts as branch-1). */
export const LEGACY_DEFAULT_BRANCH_ID = "branch-1";

export function matchesBranchScope(
  entityBranchId: string | undefined,
  scopedBranchId: string,
): boolean {
  const id = entityBranchId?.trim();
  if (!id) return scopedBranchId === LEGACY_DEFAULT_BRANCH_ID;
  return id === scopedBranchId;
}

export function filterByBranchScope<T>(
  items: T[],
  branchId: string | null | undefined,
  branchIdOf: (item: T) => string | undefined,
): T[] {
  if (!branchId) return items;
  return items.filter((item) => matchesBranchScope(branchIdOf(item), branchId));
}

/** Owner must pick a store when creating menu (null filter = not allowed for write). */
export function resolveMenuBranchId(
  ownerBranchFilter: string | null,
  explicitBranchId?: string | null,
): string | null {
  const id = (explicitBranchId ?? ownerBranchFilter)?.trim();
  return id && id.length > 0 ? id : null;
}

export function branchDisplayName(
  lookup: Map<string, string>,
  branchId: string | undefined | null,
): string {
  if (!branchId) return "Legacy (branch-1)";
  return lookup.get(branchId) ?? branchId;
}
