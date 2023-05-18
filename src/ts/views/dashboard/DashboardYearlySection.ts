//
//  DashboardYearlySection.ts
//
//  Generated by Poll Castillo on 23/02/2023.
//

import { InterfaceElement } from "../../types"
import { createChartContext } from "./CreateChartContext.js"
import { getFilterEntityData, getEntityData, getUserInfo } from "../../endpoints.js"

export const renderYearlyChart = async (): Promise<void> => {
  createChartContext('yearly')
  const chart: InterfaceElement =
    document.getElementById('yearly-chart')
    const _date = new Date()
    const _year: number = _date.getFullYear()
    let _userInfo: any = await getUserInfo()
    let currentUserInfo = await getEntityData('User', `${_userInfo.attributes.id}`)
    let raw = JSON.stringify({
      "filter": {
          "conditions": [
            {
              "property": "customer.id",
              "operator": "=",
              "value": `${currentUserInfo.customer.id}`
            },
            {
              "property": "creationYear",
              "operator": "=",
              "value": `${_year}`
            },
            {
              "property": "lastUpdateYear",
              "operator": "=",
              "value": `${_year}`
            }
          ]
      }
  });
  let statistics = await getFilterEntityData("Statistics_", raw);
  let arryVisitsGuards: any = []
  let arryVisitsClients: any = []
  let arryVisits: any = []
  let arryMarcations: any = []
  for(let i = 0; i<statistics.length; i++){
    let data = statistics[i]
    switch (data.creationMonth) {
      case 1:
        if(data.type == 'MarcConfir'){
          arryMarcations[0] = data.totalResult ? data.totalResult : 0
        }
        if(data.type == 'VisitGuardConfir'){
          arryVisitsGuards[0] = data.totalResult ?? 0
        }
        if(data.type == 'VisitClientConfir'){
          arryVisitsClients[0] = data.totalResult ?? 0
        }
        arryVisits[0] = (arryVisitsGuards[0] ? arryVisitsGuards[0] : 0) + (arryVisitsClients[0] ? arryVisitsClients[0] : 0)
      break
      case 2:
        if(data.type == 'MarcConfir'){
          arryMarcations[1] = data.totalResult ? data.totalResult : 0
        }
        if(data.type == 'VisitGuardConfir'){
          arryVisitsGuards[1] = data.totalResult ?? 0
        }
        if(data.type == 'VisitClientConfir'){
          arryVisitsClients[1] = data.totalResult ?? 0
        }
        arryVisits[1] = (arryVisitsGuards[1] ? arryVisitsGuards[1] : 0) + (arryVisitsClients[1] ? arryVisitsClients[1] : 0)
      break
      case 3:
        if(data.type == 'MarcConfir'){
          arryMarcations[2] = data.totalResult ? data.totalResult : 0
        }
        if(data.type == 'VisitGuardConfir'){
          arryVisitsGuards[2] = data.totalResult ?? 0
        }
        if(data.type == 'VisitClientConfir'){
          arryVisitsClients[2] = data.totalResult ?? 0
        }
        arryVisits[2] = (arryVisitsGuards[2] ? arryVisitsGuards[2] : 0) + (arryVisitsClients[2] ? arryVisitsClients[2] : 0)
      break
      case 4:
        if(data.type == 'MarcConfir'){
          arryMarcations[3] = data.totalResult ? data.totalResult : 0
        }
        if(data.type == 'VisitGuardConfir'){
          arryVisitsGuards[3] = data.totalResult ?? 0
        }
        if(data.type == 'VisitClientConfir'){
          arryVisitsClients[3] = data.totalResult ?? 0
        }
        arryVisits[3] = (arryVisitsGuards[3] ? arryVisitsGuards[3] : 0) + (arryVisitsClients[3] ? arryVisitsClients[3] : 0)
      break
      case 5:
        if(data.type == 'MarcConfir'){
          arryMarcations[4] = data.totalResult ? data.totalResult : 0
        }
        if(data.type == 'VisitGuardConfir'){
          arryVisitsGuards[4] = data.totalResult ?? 0
        }
        if(data.type == 'VisitClientConfir'){
          arryVisitsClients[4] = data.totalResult ?? 0
        }
        arryVisits[4] = (arryVisitsGuards[4] ? arryVisitsGuards[4] : 0) + (arryVisitsClients[4] ? arryVisitsClients[4] : 0)
      break
      case 6:
        if(data.type == 'MarcConfir'){
          arryMarcations[5] = data.totalResult ? data.totalResult : 0
        }
        if(data.type == 'VisitGuardConfir'){
          arryVisitsGuards[5] = data.totalResult ?? 0
        }
        if(data.type == 'VisitClientConfir'){
          arryVisitsClients[5] = data.totalResult ?? 0
        }
        arryVisits[5] = (arryVisitsGuards[5] ? arryVisitsGuards[5] : 0) + (arryVisitsClients[5] ? arryVisitsClients[5] : 0)
      break
      case 7:
        if(data.type == 'MarcConfir'){
          arryMarcations[6] = data.totalResult ? data.totalResult : 0
        }
        if(data.type == 'VisitGuardConfir'){
          arryVisitsGuards[6] = data.totalResult ?? 0
        }
        if(data.type == 'VisitClientConfir'){
          arryVisitsClients[6] = data.totalResult ?? 0
        }
        arryVisits[6] = (arryVisitsGuards[6] ? arryVisitsGuards[6] : 0) + (arryVisitsClients[6] ? arryVisitsClients[6] : 0)
      break
      case 8:
        if(data.type == 'MarcConfir'){
          arryMarcations[7] = data.totalResult ? data.totalResult : 0
        }
        if(data.type == 'VisitGuardConfir'){
          arryVisitsGuards[7] = data.totalResult ?? 0
        }
        if(data.type == 'VisitClientConfir'){
          arryVisitsClients[7] = data.totalResult ?? 0
        }
        arryVisits[7] = (arryVisitsGuards[7] ? arryVisitsGuards[7] : 0) + (arryVisitsClients[7] ? arryVisitsClients[7] : 0)
      break
      case 9:
        if(data.type == 'MarcConfir'){
          arryMarcations[8] = data.totalResult ? data.totalResult : 0
        }
        if(data.type == 'VisitGuardConfir'){
          arryVisitsGuards[8] = data.totalResult ?? 0
        }
        if(data.type == 'VisitClientConfir'){
          arryVisitsClients[8] = data.totalResult ?? 0
        }
        arryVisits[8] = (arryVisitsGuards[8] ? arryVisitsGuards[8] : 0) + (arryVisitsClients[8] ? arryVisitsClients[8] : 0)
      break
      case 10:
        if(data.type == 'MarcConfir'){
          arryMarcations[9] = data.totalResult ? data.totalResult : 0
        }
        if(data.type == 'VisitGuardConfir'){
          arryVisitsGuards[9] = data.totalResult ?? 0
        }
        if(data.type == 'VisitClientConfir'){
          arryVisitsClients[9] = data.totalResult ?? 0
        }
        arryVisits[9] = (arryVisitsGuards[9] ? arryVisitsGuards[9] : 0) + (arryVisitsClients[9] ? arryVisitsClients[9] : 0)
      break
      case 11:
        if(data.type == 'MarcConfir'){
          arryMarcations[10] = data.totalResult ? data.totalResult : 0
        }
        if(data.type == 'VisitGuardConfir'){
          arryVisitsGuards[10] = data.totalResult ?? 0
        }
        if(data.type == 'VisitClientConfir'){
          arryVisitsClients[10] = data.totalResult ?? 0
        }
        arryVisits[10] = (arryVisitsGuards[10] ? arryVisitsGuards[10] : 0) + (arryVisitsClients[10] ? arryVisitsClients[10] : 0)
      break
      case 12:
        if(data.type == 'MarcConfir'){
          arryMarcations[11] = data.totalResult ? data.totalResult : 0
        }
        if(data.type == 'VisitGuardConfir'){
          arryVisitsGuards[11] = data.totalResult ?? 0
        }
        if(data.type == 'VisitClientConfir'){
          arryVisitsClients[11] = data.totalResult ?? 0
        }
        arryVisits[11] = (arryVisitsGuards[11] ? arryVisitsGuards[11] : 0) + (arryVisitsClients[11] ? arryVisitsClients[11] : 0)
      break
      default:
      break
    }
  }
  // @ts-ignore
  new Chart(chart, {
    type: 'bar',
    data: {
      labels: [
        'Ene',
        'Feb',
        'Mar',
        'Abr',
        'May',
        'Jun',
        'Jul',
        'Ago',
        'Sep',
        'Oct',
        'Nov',
        'Dic'
      ],
      datasets: [
        {
          label: 'Visitas',
          data: arryVisits,
          borderWidth: 1
        },
        {
          label: 'Marcaciones',
          data: arryMarcations,
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        },
        title: {
          display: true,
          text: 'Registros de 2023'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  })
}