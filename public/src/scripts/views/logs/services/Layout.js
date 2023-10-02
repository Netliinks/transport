export const tableLayout = `
<div class="datatable" id="datatable">
  <div class="datatable_header">
    <div class="datatable_title" id="datatable-title"><h1>Logs Servicios</h1></div>
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
    
      <button class="datatable_button import_user" id="export-entities">Exportar</button>
    </div>
  </div>

  <table class="datatable_content">
    <thead><tr>
      <th><span data-type="name">
        Acción <i class="fa-regular fa-filter"></i>
      </span></th>

      <th><span data-type="description">
        Detalle <i class="fa-regular fa-filter"></i>
      </span></th>

      <th><span data-type="user">
        Usuario <i class="fa-regular fa-filter"></i>
      </span></th>

      <th><span data-type="date">
        Fecha <i class="fa-regular fa-filter"></i>
      </span></th>

      <th><span data-type="time">
        Tiempo <i class="fa-regular fa-filter"></i>
      </span></th>

      <!-- th class="header_filled header_key"></!-->

      <th class="header_filled"></th>

    </tr></thead>
    <tbody id="datatable-body" class="datatable_body">

    </tbody>
  </table>

  </div>
  <div class="datatable_footer margin_t_8">
    <div class="datatable_pagination" id="pagination-container"></div>
  </div>`;
export const UIRightSidebar = `
    <div class="entity_editor" id="entity-editor">
    <div class="entity_editor_header">
      <div class="user_info">
        <div class="avatar"><i class="fa-regular fa-magnifying-glass"></i></div>
        <h1 class="entity_editor_title">Detalles del <br><small>log</small></h1>
      </div>

      <button class="btn btn_close_editor" id="close"><i class="fa-solid fa-x"></i></button>
    </div>

    <!-- EDITOR BODY -->
    <div class="entity_editor_body">

        <h2 id="log-name">Cargando</h2>
        <p id="log-description" style="word-break: break-all">Por favor espere...</p><br><br>

        <div class="input_detail">
            <label for="log-user"><i class="fa-solid fa-user"></i></label>
            <input type="text" id="log-user" class="input_filled" readonly>
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
        <br>
        <div class="input_detail">
            <label for="log-service"><i class="fa-solid fa-desktop"></i></label>
            <input type="text" id="log-service" class="input_filled" readonly>
        </div>
        <br>
        <div class="input_detail">
            <label for="log-customer"><i class="fa-solid fa-buildings"></i></label>
            <input type="text" id="log-customer" class="input_filled" readonly>
        </div>

    </div>
    <!-- END EDITOR BODY -->
    </div>
    `;