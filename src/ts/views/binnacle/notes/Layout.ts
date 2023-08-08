//
//  Layout.ts
//
//  Generated by Poll Castillo on 09/03/2023.
//
export const UIContentLayout = `
    <div class="datatable" id="datatable">
        <div class="datatable_header">
            <div class="datatable_title"><h1 id="view-title"></h1></div>
            <div class="datatable_tools" id="datatable-tools">
                <input type="search" class="search_input" placeholder="Buscar" id="search">
                <button
                    class="datatable_button add_user"
                    id="btnSearch">
                    <i class="fa-solid fa-search"></i>
                </button>
                <button class="datatable_button" id="export-button">Exportar</button>
            </div>
        </div>

        <table class="datatable_content">
        <thead><tr>
            <th><span data-type="title">
            Título <i class="fa-regular fa-filter"></i>
            </span></th>

            <th><span data-type="content">
            Contenido <i class="fa-regular fa-filter"></i>
            </span></th>

            <th class="thead_centered" width=220><span data-type="date">
            Fecha <i class="fa-regular fa-filter"></i>
            </span></th>

            <th class="thead_centered" width=130><span data-type="details">
            Detalles
            </span></th>

        </tr></thead>
        <tbody id="datatable-body" class="datatable_body">

        </tbody>
        </table>
    </div>
    <div class="datatable_footer">
        <div class="datatable_pagination" id="pagination-container"></div>
    </div>

    <!-- The Modal -->
    <div id="modalZoom" class="modal_zoom">
        <span class="close-zoom" id="close-modalZoom">&times;</span>
        <img class="modal-content-zoom" id="img01">
        <div id="caption" class="caption-zoom"></div>
    </div>
    `

export const UIRightSidebar = `
    <div class="entity_editor" id="entity-editor">
    <div class="entity_editor_header">
      <div class="user_info">
        <div class="avatar"><i class="fa-regular fa-magnifying-glass"></i></div>
        <h1 class="entity_editor_title">Detalles del <br><small>reporte</small></h1>
      </div>

      <button class="btn btn_close_editor" id="close"><i class="fa-solid fa-x"></i></button>
    </div>

    <!-- EDITOR BODY -->
    <div class="entity_editor_body">
        <div id="note-picture-placeholder">

        </div>

        <h2 id="note-title">Cargando</h2>
        <p id="note-content" style="word-break: break-all">Por favor espere...</p><br><br>

        <div class="input_detail">
            <label for="note-author"><i class="fa-solid fa-user"></i></label>
            <input type="text" id="note-author" class="input_filled" readonly>
        </div>
        <br>
        <div class="input_detail">
            <label for="note-author-id"><i class="fa-solid fa-at"></i></label>
            <input type="text" id="note-author-id" class="input_filled" readonly>
        </div>
        <br>
        <div class="input_detail">
            <label for="creation-date"><i class="fa-solid fa-calendar"></i></label>
            <input type="date" id="creation-date" class="input_filled" readonly>
        </div>
        <br>
        <div class="input_detail">
            <label for="creation-time"><i class="fa-solid fa-clock"></i></label>
            <input type="time" id="creation-time" class="input_filled" readonly>
        </div>

    </div>
    <!-- END EDITOR BODY -->
    </div>
    `

export const UIExportSidebar = `
<div class="entity_editor" id="entity-editor">
<div class="entity_editor_header">
  <div class="user_info">
    <div class="avatar"><i class="fa-regular fa-magnifying-glass"></i></div>
    <h1 class="entity_editor_title">Exportar <br><small> reportes</small></h1>
  </div>

  <button class="btn btn_close_editor" id="close"><i class="fa-solid fa-x"></i></button>
</div>

<!-- EDITOR BODY -->
<div class="entity_editor_body">
    <label class="label" for="timestamp-from">Desde</label>
    <input type="date" id="timestamp-from">
    <br>
    <label class="label" for="timestamp-to">Hasta</label>
    <input type="date" id="timestamp-to">
</div>
<!-- END EDITOR BODY -->
<div class="entity_editor_footer">
    <button class="btn btn_primary btn_widder" id="export-data">Exportar</button>
    </div>

</div>
`