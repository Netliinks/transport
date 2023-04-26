//
//  Dashboar.ts
//
//  Generated by Poll Castillo on 23/02/2023.
//

import { getData, getEntitiesData } from "../../endpoints.js"
import { CloseDialog, inputObserver } from "../../tools.js"
import { InterfaceElement } from "../../types.js"
import { Announcements } from "./Announcements/Announcements.js"
import { renderDailyChart } from "./DashboardDailySection.js"
import { renderMonthlyChart } from "./DashboardMonthtlySection.js"
import { renderWeeklyChart } from "./DashboardWeeklySection.js"
import { renderYearlyChart } from "./DashboardYearlySection.js"

namespace NDashbd {
  export interface IRender {
    render(): void
    interface(container: InterfaceElement): void
  }
}

export class Dashboard implements NDashbd.IRender {
  private interfaceContainer: InterfaceElement =
    document.getElementById('datatable-container')

  private dashboardContainer: InterfaceElement =
    document.createElement('div')

  public render() {
    this.dashboardContainer.classList.add('dashboard_container')
    this.dashboardContainer.setAttribute('id', 'dashboard-container')
    this.interfaceContainer.innerHTML = ""
    this.interfaceContainer.appendChild(this.dashboardContainer)
    this.interface(this.dashboardContainer)
    // @ts-ignore
    feather.replace()
  }

  public interface(container: InterfaceElement) {
    container.innerHTML = `
      <h1>Dashboard</h1>
      <div class="dashboard_content">

        <!-- START LEFT SECTION -->
        <div class="dashboard_stadistics">
          <div class="dashboard_buttonCluster">
            <button class="dashboard_buttonCluster-button dashboard_buttonCluster_buttonActive"
              id="daily-chart-button">
              <span>Vista de <br><b>hoy</b></span>
              <i class="fa-solid fa-calendar-day"></i>
            </button>

            <button class="dashboard_buttonCluster-button"
              id="weekly-chart-button">
              <span>Vista por <br><b>semana</b></span>
              <i class="fa-solid fa-calendar-week"></i>
            </button>

            <button class="dashboard_buttonCluster-button"
              id="monthly-chart-button">
              <span>Vista por <br><b>mes</b></span>
              <i class="fa-solid fa-calendar-days"></i>
            </button>

            <button class="dashboard_buttonCluster-button"
              id="yearly-chart-button">
              <span>Vista por <br><b>año</b></span>
              <i class="fa-solid fa-calendar-lines"></i>
            </button>
          </div>

          <!-- RENDER CHARTS HERE -->
          <div class="chart_container">
            <canvas id="weekly-chart" width="100%"></canvas>
          </div>
          <!-- END RENDER CHARTS -->

          <!-- RENDER DATATABLE HERE -->
          <!-- <div class="dashboard_datatable">
            <h2>Visitas recientes</h2>
            <table class="datatable_content margin_t_16">
              <thead>
                <tr>
                  <th>CI</th>
                  <th>Nombre</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Estado</th>
                </tr>
              </thead>
            </table>
          </div> -->
          <!-- END RENDER DATATABLE -->

        </div>
        <!-- END LEFT SECTION -->

        <!-- START RIGHT SECTION -->
        <div class="dashboard_news_and_notes">
        <!-- News card -->
          <div class="news">
            <div class="cards">
              <div class="cards_container" id="cards-container"></div>
              <div class="cards_controls_container" id="cards-controls-container"></div>
            </div>

            <button class="btn btn_new_announcement margin_t_8" id="new-announcement"><i class="fa-regular fa-plus margin_r_8"></i> Nuevo anuncio</button>

          </div>
        <!-- End news card -->
          <div class="notes">
            <h1>Últimas notas</h1>
              <table class="table">
                <thead>
                  <tr>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody id="table-body-notes">

                </tbody>
              </table>
            </div>
          </div>
        </div>
        <!-- END RIGHT SECTION -->
      </div>
    `

    renderDailyChart()
    new Announcements().render()

    const buttonCluster: InterfaceElement = document.querySelectorAll('.dashboard_buttonCluster-button')
    buttonCluster.forEach((button: InterfaceElement) => {
      button.addEventListener('click', (): void => {
        buttonCluster.forEach((button: InterfaceElement) => {
          button.classList.remove('dashboard_buttonCluster_buttonActive')
        })

        button.classList.add('dashboard_buttonCluster_buttonActive')
      })
    })

    const dailyChart: InterfaceElement =
      document.getElementById('daily-chart-button')
    dailyChart.addEventListener('click', (): void => {
      renderDailyChart()
    })

    const weeklyChart: InterfaceElement =
      document.getElementById('weekly-chart-button')
    weeklyChart.addEventListener('click', (): void => {
      renderWeeklyChart()
    })

    const monthlyChart: InterfaceElement =
      document.getElementById('monthly-chart-button')
    monthlyChart.addEventListener('click', (): void => {
      renderMonthlyChart()
    })

    const yearlyChart: InterfaceElement =
      document.getElementById('yearly-chart-button')
    yearlyChart.addEventListener('click', (): void => {
      renderYearlyChart()
    })

    this.renderlastNotes()
  }

  private async renderlastNotes(): Promise<void> {
    async function getNotes() {
      //let url: string = 'https://backend.netliinks.com:443/rest/entities/Note?fetchPlan=full&&limit=5&&offset=0'
      //return await getData(url)
      const customerId = localStorage.getItem('customer_id')
      const notesRaw = await getEntitiesData('Note')
      const notes = notesRaw.filter((data: any) => `${data.customer?.id}` === `${customerId}`)
      let filterNotes = []
      for(let i = 0; i < 5; i++){
        filterNotes.push(notes[i])
      }
      return filterNotes
      }

    const tableBody: InterfaceElement = document.getElementById('table-body-notes')
    let _notes = await getNotes()

    for (let i = 0; i < _notes.length; i++) {
      let note = _notes[i]
      let row: InterfaceElement = document.createElement('TR')
      let noteCreationDate = note.creationDate.split('T')
      let creationDate = noteCreationDate[0]

      row.innerHTML += `
                <td>${note.content}</td>
                <td>${creationDate}</td>
            `

      tableBody.appendChild(row)
    }
  }

  private close(): void {
    const closeButton: InterfaceElement = document.getElementById('close')
    const editor: InterfaceElement = document.getElementById('entity-editor-container')

    closeButton.addEventListener('click', () => {
      console.log('close')
      new CloseDialog().x(editor)
    }, false)
  }
}