import { AsyncLocalStorage } from "async_hooks";

interface TenantStore {
  organizationId: string;
}

// Low-level isolated memory storage cell tracking concurrent async threads safely
export const tenantStorage = new AsyncLocalStorage<TenantStore>();

export const TenantContext = {
  /**
   * Retrieves the organizationId of the active tenant from the current execution context.
   */
  getOrganizationId(): string | undefined {
    return tenantStorage.getStore()?.organizationId;
  },

  /**
   * Wraps an execution branch, locking down a static multi-tenant scope parameter block.
   */
  run<T>(organizationId: string, operation: () => T): T {
    return tenantStorage.run({ organizationId }, operation);
  }
};