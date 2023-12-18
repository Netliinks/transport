//d
//  login.ts
//
//  Generated by Poll Castillo on 15/02/2023.
//

import { getUserInfo, _userAgent, getEntityData, getEntitiesData, updateEntity, getFilterEntityData } from "./endpoints.js"
import { RenderApplicationUI } from "./layout/interface.js"
import { InterfaceElement, Request } from "./types.js"
//import { registryPlataform } from "./tools.js"

const loginContainer: InterfaceElement = document.getElementById('login-container')
const app: InterfaceElement = document.getElementById('app')

const connectionHeader = {
    Accept: "application/json",
    "User-agent": _userAgent,
    Authorization: "Basic YzNjMDM1MzQ2MjoyZmM5ZjFiZTVkN2IwZDE4ZjI1YmU2NDJiM2FmMWU1Yg==",
    "Content-Type": "application/x-www-form-urlencoded",
    Cookie: "JSESSIONID=CDD208A868EAABD1F523BB6F3C8946AF",
}

const platformSystem: string = 'clients'

const reqOP: Request = {
    url: 'https://transport2.netliinks.com:443/oauth/token',
    method: 'POST'
}

export class SignIn {
    public async checkSignIn(): Promise<void> {
        const accessToken = localStorage.getItem('access_token')

        const checkUser = async (): Promise<void> => {
            let currentUser = await getUserInfo()
            const businessId: any = localStorage.getItem('business_id')
            const userType: any = localStorage.getItem('user_type')
            if (currentUser.error === 'invalid_token') {
                this.signOut()
            }
            if(businessId == null || userType == null){
                let user = await getEntityData('User', currentUser.attributes.id)
                if(user.business?.id != null || user.business?.id != undefined){
                    localStorage.setItem('business_id', user.business?.id)
                    localStorage.setItem('user_type', currentUser.attributes.userType)  
                    window.location.reload()
                }else{
                    this.signOut()
                    alert('Usuario no tiene asignado empresa.')
                }    
            }else{
                let user = await getEntityData('User', currentUser.attributes.id);
                let business = await getEntityData('Business', user?.business?.id);
                if(user?.state?.name == 'Enabled' && business?.state?.name == 'Enabled' && user.isSuper == true && (user.userType == 'ADMIN' || user.userType == 'OPERATOR')){
                    localStorage.setItem('business_id', user.business?.id)
                    localStorage.setItem('user_type', currentUser.attributes.userType)  
                    new RenderApplicationUI().render();
                }else{
                    this.signOut();
                }
            }
        }

        if (accessToken) {
            checkUser()
        } else {
            this.showLogin()
            console.info('You need login')
        }

    }

    public showLogin(): void {
        loginContainer.style.display = 'flex !important'
        loginContainer.innerHTML = `
        <div class="login_window">
        <div class="login_header">
          <!-- <img src="./public/src/assets/pictures/app_logo.png"> -->
          <h1 class="login_title">Iniciar Sesión</h1>
          <p>Inicie sesión con los datos proporcionados por el proveedor.</p>
        </div>
        <div class="login_content">
          <form id="login-form">
            <div class="input">
              <label for="username">
                <i class="fa-regular fa-user"></i>
              </label>
              <input type="text" id="username"
                placeholder="johndoe@mail.com">
            </div>

            <div class="input">
              <label for="password">
                <i class="fa-regular fa-key"></i>
              </label>
              <input type="password" id="password"
                placeholder="••••••••••••">
            </div>
            <button class="btn btn_primary" id="login">Iniciar Sesión</button>
          </form>
        </div>

        <div class="login_footer">
          <div class="login_icons">
            <i class="fa-regular fa-house"></i>
            <i class="fa-regular fa-user"></i>
            <i class="fa-regular fa-inbox"></i>
            <i class="fa-regular fa-file"></i>
            <i class="fa-regular fa-computer"></i>
            <i class="fa-regular fa-mobile"></i>
          </div>
          <p>Accede a todas nuestras herramientas</p>

          <div class="foot_brief">
            <p>Desarrollado por</p>
            <img src="./public/src/assets/pictures/login_logo.png">
          </div>
        </div>
      </div>
        `
        this.signIn()
    }

    private signIn(): void {
        const form: InterfaceElement = document.querySelector('#login-form')
        const password: InterfaceElement = form.querySelector('#password')
        const userName: InterfaceElement = form.querySelector('#username')
        const trigger: InterfaceElement = form.querySelector('#login')

        trigger.addEventListener('click', (e: any): void => {
            e.preventDefault()

            if (userName.value.trim() == '' || userName.value.trim() == null) {
                console.error('El campo nombre de usuario no puede estar vacío.')
                alert('El campo nombre de usuario no puede estar vacío.')
            }
            else if (password.value.trim() == '' || password.value.trim() == null) {
                console.log('El campo contraseña no puede estar vacío')
                alert('El campo contraseña no puede estar vacío.')
            }
            else {
                connect(userName.value, password.value)
            }
        })

        async function connect(user: string, password: string): Promise<void> {
            const reqOptions: {} = {
                method: reqOP.method,
                body: `grant_type=password&username=${user}&password=${password}`,
                headers: connectionHeader
            }

            fetch(reqOP.url, reqOptions)
                .then((res: Response) => res.json())
                .then((res: any) => {
                    if (res.error == 'Bad credentials') {
                        console.error('error en las credenciales')
                    }
                    else {
                        const connectionData = {
                            token: res.access_token,
                            expiresIn: res.expires_in,
                            refreshToken: res.refresh_token,
                            scope: res.scope,
                            tokenType: res.token_type
                        }
                        localStorage.setItem('access_token', connectionData.token)
                        window.location.reload()
                    }

                })
        }
    }

    public signOut(): void {
        localStorage.removeItem('access_token')
        localStorage.removeItem('business_id')
        localStorage.removeItem('user_type')
        this.checkSignIn()
        window.location.reload()
    }

}