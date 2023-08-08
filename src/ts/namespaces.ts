//
//  namespaces.ts
//
//  Generated by Poll Castillo on 28/02/2023.
//
export namespace NUsers {
  export interface IClients {
    /**
     * Renderize interfaces, load functions and read functions
     */
    render(offset: any, actualPage: any, search: any): void
    /**
     * Load Interface
     */
    load(table: any, currentPage: number, data: any): void

    /**
     * Register a new entity
     */
    register(container: any, data: any): void

    /**
     * Import entities
     */
    import(): void

    /**
     * Edit entity
     */
    edit(container: any, data: any): void

    /**
     * Remove entity
     */
    remove(): void

    /**
     * convert entity to super user
     */
    convertToSuper(): void
  }

  export interface IEmployees {
    /**
     * Renderize interfaces, load functions and read functions
     */
    render(offset: any, actualPage: any, search: any): void
    /**
     * Load Interface
     */
    load(table: any, currentPage: number, data: any): void

    /**
     * Register a new entity
     */
    register(container: any, data: any): void

    /**
     * Import entities
     */
    // import(): void

    /**
     * Edit entity
     */
    edit(container: any, data: any): void

    /**
     * Remove entity
     */
    remove(): void
  }

  export interface IContractors {
    /**
     * Renderize interfaces, load functions and read functions
     */
    render(offset: any, actualPage: any, search: any): void
    /**
     * Load Interface
     */
    load(table: any, currentPage: number, data: any): void

    /**
     * Register a new entity
     */
    register(container: any, data: any): void

    /**
     * Import entities
     */
    // import(): void

    /**
     * Edit entity
     */
    edit(container: any, data: any): void

    /**
     * Remove entity
     */
    remove(): void
  }
}