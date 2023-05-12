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

                <button class="datatable_button import_user" id="export-entities">Exportar</button>
            </div>
        </div>

        <table class="datatable_content">
        <thead><tr>
            <th><span data-type="name">
            Nombre <i class="fa-regular fa-filter"></i>
            </span></th>

            <th><span data-type="CI">
            CI <i class="fa-regular fa-filter"></i>
            </span></th>

            <th class="thead_centered" width=100><span data-type="date">
            Fecha <i class="fa-regular fa-filter"></i>
            </span></th>

            <th class="thead_centered" width=120><span data-type="time">
            Hora <i class="fa-regular fa-filter"></i>
            </span></th>

            <th class="thead_centered" width=150><span data-type="citadel">
            Generado por <i class="fa-regular fa-filter"></i>
            </span></th>

            <th class="thead_centered" width=110><span data-type="state">
            Estado <i class="fa-regular fa-filter"></i>
            </span></th>

            <th class="thead_centered" width=150><span data-type="citadel">
            Ciudadela <i class="fa-regular fa-filter"></i>
            </span></th>

            <th class="thead_centered" width=120><span data-type="details">
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
        `;
export const UIRightSidebar = `
<div class="entity_editor" id="entity-editor">
<div class="entity_editor_header">
  <div class="user_info">
    <div class="avatar"><i class="fa-regular fa-user"></i></div>
    <h1 class="entity_editor_title">Detalles <br><small>Visitas</small></h1>
    </div>
  <button class="btn btn_close_editor" id="close"><i class="fa-regular fa-x"></i></button>
</div>

<!-- EDITOR BODY -->
<div class="entity_editor_body">
  <div class="tag"><i class="label active_label"><i class="fa-solid fa-circle-dot"></i> Estado:</i> <span class="tag_gray" id="visit-status"></span></div>
  <br><br>

  <div class="material_input">
    <input type="text" id="visit-name" autocomplete="none" class="input_filled">
    <label for="visit-name"><i class="fa-solid fa-user"></i> Nombre</label>
  </div>

  <div class="material_input">
    <input type="text" id="visit-reason" autocomplete="none" class="input_filled">
    <label for="visit-reasons"><i class="fa-solid fa-seal-question"></i> Asunto</label>
  </div>

  <div class="material_input">
    <input type="text" id="visit-citadel" autocomplete="none" class="input_filled">
    <label for="visit-citadel"><i class="fa-solid fa-buildings"></i> Ciudadela</label>
  </div>

  <div class="material_input">
    <input type="text" id="visit-citadelid" autocomplete="none" class="input_filled">
    <label for="visit-citadelid"><i class="fa-solid fa-hashtag"></i> Ciudadela - ID</label>
  </div>

  <div class="material_input">
    <input type="text" id="visit-department" autocomplete="none" class="input_filled">
    <label for="visit-department"><i class="fa-solid fa-building"></i> Departamento</label>
  </div>

  <div class="material_input">
    <input type="text" id="visit-authorizedby" autocomplete="none" class="input_filled">
    <label for="visit-authorizedby"><i class="fa-solid fa-shield"></i> Autorizado por</label>
  </div>

  <div class="material_input">
    <input type="text"
      id="entity-phone"
      maxlength="10" autocomplete="none">
    <label for="entity-phone">Teléfono</label>
  </div>

  <!-- Start marking -->
    <h3>Ingreso</h3>
    <br>
    <div class="input_detail">
        <label for="ingress-date"><i class="fa-solid fa-calendar"></i></label>
        <input type="date" id="ingress-date" class="input_filled" readonly>
    </div>
    <br>
    <div class="input_detail">
        <label for="ingress-time"><i class="fa-solid fa-clock"></i></label>
        <input type="time" id="ingress-time" class="input_filled" readonly>
    </div>
    <br>
    <div class="input_detail">
        <label for="ingress-guard-id"><i class="fa-solid fa-user-police"></i></label>
        <input type="text" id="ingress-guard-id" class="input_filled" readonly>
    </div>
    <br>
    <div class="input_detail">
        <label for="ingress-guard-name"><i class="fa-solid fa-user-police"></i></label>
        <input type="text" id="ingress-guard-name" class="input_filled" readonly>
    </div>
    <br>
    <!-- End marking -->
    <h3>Salida</h3>
    <br>
    <div class="input_detail">
        <label for="egress-date"><i class="fa-solid fa-calendar"></i></label>
        <input type="date" id="egress-date" class="input_filled" readonly>
    </div>
    <br>
    <div class="input_detail">
        <label for="egress-time"><i class="fa-solid fa-clock"></i></label>
        <input type="time" id="egress-time" class="input_filled" readonly>
    </div>
    <br>
    <div class="input_detail">
        <label for="egress-guard-id"><i class="fa-solid fa-user-police"></i></label>
        <input type="text" id="egress-guard-id" class="input_filled" readonly>
    </div>
    <br>
    <div class="input_detail">
        <label for="egress-guard-name"><i class="fa-solid fa-user-police"></i></label>
        <input type="text" id="egress-guard-name" class="input_filled" readonly>
    </div>
    <br>
    <h3>Galería</h3>

    <div id="galeria">
    </div>
</div>
<!-- END EDITOR BODY -->
</div>
`;
