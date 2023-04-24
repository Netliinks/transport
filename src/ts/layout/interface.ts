//
//  interface.ts
//
//  Generated by Poll Castillo on 15/02/2023.
//

import { getEntityData, getUserInfo } from "../endpoints.js"
//import { Dashboard } from "../views/dashboard/dashboard.js"
import { SignIn } from "../login.js"
import { InterfaceElement } from "../types.js"
import { Sidebar } from "./sidebar.js"

export class RenderApplicationUI {
    private loginContainer: InterfaceElement = document.getElementById('login-container')
    private APP: InterfaceElement = document.getElementById('app')
    private sidebarContainer: InterfaceElement = document.getElementById('app-sidebar')
    private topbar: InterfaceElement = document.getElementById('app-topbar')

    public render(): void {
        this.loginContainer.style.display = 'none'
        this.APP.style.display = 'grid'
        this.sidebarContainer.style.display = 'inline-flex'
        this.topbar.style.display = 'flex'

        this.renderTopbar()
        new Sidebar().render()
        //new Dashboard().render()
    }

    private async renderTopbar(): Promise<void> {
        const currentUser = await getUserInfo()
        const user = await getEntityData('User', currentUser.attributes.id)

        let topbar =
            this.topbar.innerHTML = `
            <div class="user">
                <span class="welcome">Bienvenido</span>
                <span class="separator"></span>
                <div class="userAvatar">
                    <i class="fa-solid fa-user"></i>
                </div>
                <div class="nameAndCustomer">
                    <p id="current-username" class="name">
                    ${user.firstName} ${user.lastName}
                    </p>
                    <p id="current-user-customer" class="customer">${user.username}</p>
                </div>
               <div class="settings_button">
                 <button id="settings-button">
                   <i class="fa-solid fa-gear"></i>
                 </button>
               </div>
               <div class="user_settings" id="user-settings">
                 <button class="btn btn_transparent btn_widder">Preferencias</button>
                 <button class="btn btn_transparent btn_widder">Cambiar Contraseña</button>
                 <br>
                 <button class="btn btn_primary btn_widder" id="logout-button">Cerrar sesión</button>
               </div>
             </div>
        `
        this.topbar.innerHTML = topbar

        const options: InterfaceElement =
            document.getElementById('settings-button')

        options.addEventListener('click', () => {
            const settingOptions: InterfaceElement = document.getElementById('user-settings')


            const logoutButton: InterfaceElement = document.getElementById('logout-button')

            settingOptions.classList.toggle("user_settings_visible")

            logoutButton.addEventListener("click", (): void => {
                new SignIn().signOut()
            })
        })
    }
}

const renderSetting = (): void => {
    const options: InterfaceElement =
        document.getElementById('settings-button')

    options.addEventListener('click', () => {
        const settingOptions =
            <HTMLElement>document.querySelector("#user-settings")

        const logoutButton =
            <HTMLElement>settingOptions.querySelector("#logout")

        settingOptions.classList.toggle("user_settings_visible")

        logoutButton.addEventListener("click", (): void => {
            new SignIn().signOut()
        })
    })

}

// new Dashboard().render()