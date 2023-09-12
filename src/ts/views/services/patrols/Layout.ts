//
//  Layout.ts
//
//  Generated by Poll Castillo on 13/03/2023.
//
import { userPermissions } from "../../../tools.js"
export const tableLayout = `
  <div class="datatable" id="datatable">
    <div class="datatable_header">
      <div class="datatable_title" id="datatable-title">
        <h1>Patrullas</h1>
        <h2 id="datatable_subtitle">Cargando...</h2>
      </div>
      <div class="datatable_tools" id="datatable-tools">
        <input type="search"
        class="search_input"
        placeholder="Buscar"
        id="search">
        <button
            class="datatable_button add_user"
            id="btnSearch">
            <i class="fa-solid fa-search"></i>
        </button>
        <button
          class="datatable_button add_user"
          id="new-entity" style="display:${userPermissions().style};">
          <i class="fa-solid fa-add"></i>
        </button>
      </div>
    </div>

    <table class="datatable_content">
      <thead><tr>
        <th><span data-type="patrol">
          Patrulla <i class="fa-regular fa-filter"></i>
        </span></th>

        <th><span data-type="category">
          Categoría <i class="fa-regular fa-filter"></i>
        </span></th>

        <th class="header_filled"></th>

      </tr></thead>
      <tbody id="datatable-body" class="datatable_body">

      </tbody>
    </table>

    </div>

    <div class="datatable_footer">
      <div class="datatable_pagination" id="pagination-container"></div>
    </div>`
