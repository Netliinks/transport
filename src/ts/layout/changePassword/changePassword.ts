//
//  VisitsView.ts
//
//  Generated by Poll Castillo on 09/03/2023.
//
import { Config } from "../../Configs.js"
import { setPassword, getUserInfo } from "../../endpoints.js"
import { Services } from "../../views/services/Services.js"
import { inputObserver } from "../../tools.js"
import { InterfaceElement } from "../../types.js"
import { tableLayout } from "./Layout.js"

// Local configs
const tableRows = Config.tableRows
let currentPage = Config.currentPage
const pageName = 'Cambio Clave'


export class ChangePassword {
    private dialogContainer: InterfaceElement = document.getElementById('app-dialogs')
    private siebarDialogContainer: InterfaceElement = document.getElementById('entity-editor-container')
    private appContainer: InterfaceElement = document.getElementById('datatable-container')

    public render = async (): Promise<void> => {
        this.appContainer.innerHTML = ''
        this.appContainer.innerHTML = tableLayout

        // Getting interface elements
        const viewTitle: InterfaceElement = document.getElementById('view-title')
        const tableBody: InterfaceElement = document.getElementById('datatable-body')
        this.changeUserPassword()
    }

    private changeUserPassword(): void {
        this.dialogContainer.style.display = 'block'
        this.dialogContainer.innerHTML = `
            <div class="dialog_content" id="dialog-content">
                <div class="dialog">
                    <div class="dialog_container padding_8">
                        <div class="dialog_header">
                            <h2>Actualizar contraseña</h2>
                        </div>

                        <div class="dialog_message padding_8">
                            <div class="material_input">
                                <input type="password" id="password" autocomplete="none">
                                <label for="entity-lastname"><i class="fa-solid fa-lock"></i> Nueva contraseña</label>
                            </div>

                            <div class="material_input">
                                <input type="password" id="re-password" autocomplete="none">
                                <label for="entity-lastname"><i class="fa-solid fa-lock"></i> Repetir contraseña</label>
                            </div>
                        </div>

                        <div class="dialog_footer">
                            <button class="btn btn_primary" id="cancel">Cancelar</button>
                            <button class="btn btn_danger" id="update-password">Actualizar</button>
                        </div>
                    </div>
                </div>
            </div>
        `
        inputObserver()
        const _password: InterfaceElement = document.getElementById('password')
        const _repassword: InterfaceElement = document.getElementById('re-password')
        const _updatePasswordButton: InterfaceElement = document.getElementById('update-password')
        const _closeButton: InterfaceElement = document.getElementById('cancel')
        const _dialog: InterfaceElement = document.getElementById('dialog-content')

        _updatePasswordButton.addEventListener('click', async() => {
            const currentUser = await getUserInfo()
            if (_password.value === '') {
                alert('El campo "Contraseña" no puede estar vacío.')
            }
            else if (_repassword.value === ' ') {
                alert('Debe repetir la contraseña para continuar')
            }
            else if (_password.value === _repassword.value) {
                let raw: string = JSON.stringify({
                    "id": `${currentUser.attributes.id}`,
                    "newPassword": `${_password.value}`
                })

                setPassword(raw)
                    .then((): void => {
                        setTimeout((): void => {
                            //alert('Se ha cambiado la contraseña')
                            //new CloseDialog().x(_dialog)
                            window.location.reload()
                        }, 1000)
                    })
            }
            else {
                console.log('Las contraseñas no coinciden')
                alert('Las contraseñas no coinciden')
            }
        })

        _closeButton.onclick = () => {
            //new Dashboard().render()
            //new CloseDialog().x(_dialog)
            window.location.reload()
        }

    }

}