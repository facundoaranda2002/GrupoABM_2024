import { Component, OnInit } from '@angular/core';
import {
  TooltipComponent,
  TooltipComponentOption,
  LegendComponent,
  LegendComponentOption,
  GridComponent
} from 'echarts/components';

import { BarChart, BarSeriesOption, PieChart, PieSeriesOption, LineChart } from 'echarts/charts';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LabelLayout } from 'echarts/features';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, NavController, IonButton, IonIcon, IonButtons } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/service/auth.service';
import { ClienteService } from 'src/app/service/cliente.service';

echarts.use([
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
  LabelLayout,
  PieChart,
  BarChart,
  LineChart,
  GridComponent
]);

type EChartsOption = echarts.ComposeOption<
  TooltipComponentOption | LegendComponentOption | PieSeriesOption | BarSeriesOption
>;


@Component({
  selector: 'app-graficos',
  templateUrl: './graficos.page.html',
  styleUrls: ['./graficos.page.scss'],
  standalone: true,
  imports: [IonButtons, IonIcon, IonButton, IonContent, IonHeader, IonTitle, IonToolbar]
})
export class GraficosPage implements OnInit {

  public chartBarDom: HTMLElement | any;
  public myBarChart: any;
  public optionBar: any;

  public chartPieDom: HTMLElement | any;
  public myPieChart: any;
  public optionPie: any;

  public chartLineDom: HTMLElement | any;
  public myLineChart: any;
  public optionLine: any;



  constructor(private firestore: ClienteService,
    public auth: AuthService,
    private router: Router,
    private navController: NavController) { }

  ngOnInit() {
  }

  public async onBackClick() {
    this.navController.back();
  }

  async ngAfterViewInit() {
    let data = await this.firestore.getVotosComida();
    this.chartBarDom = document.getElementById('bar');
    this.myBarChart = echarts.init(this.chartBarDom);
    this.optionBar = {
      xAxis: {
        type: 'category',
        data: ["1", "2", "3", "4", "5"],
        name: "Puntaje elegido",
        nameLocation: "middle",
        nameTextStyle: {
          fontSize: 20,
          lineHeight: 40,
          color: '#060606' // Color más oscuro para el nombre del eje
        },
        axisLabel: {
          fontSize: 16, // Aumenta el tamaño de los números en el eje x
          color: '#060606' // Color más oscuro para los números en el eje x
        }
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        axisLabel: {
          fontSize: 16, // Aumenta el tamaño de los números en el eje y
          color: '#060606' // Color más oscuro para los números en el eje y
        }
      },
      series: [
        {
          data: data,
          type: 'bar',
          itemStyle: {
            color: '#B84141', // Puedes cambiar este valor al color que desees
            emphasis: {
              color: '#703039' // Color cuando se enfatiza (por ejemplo, al pasar el mouse)
            }
          },
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(180, 180, 180, 0.2)'
          }
        }
      ]
    };

    this.optionBar && this.myBarChart.setOption(this.optionBar);
    window.addEventListener('resize', this.myBarChart.resize);

    let data2 = await this.firestore.getVotosServicio();
    const colorPalette = ['#D14545', '#302DE9', '#F011E5', '#406646', '#C58023'];

    this.chartPieDom = document.getElementById('pie');
    this.myPieChart = echarts.init(this.chartPieDom);
    this.optionPie = {
      tooltip: {
        trigger: 'item'
      },
      color: colorPalette,  // Utiliza la gama de colores definida
      series: [
        {
          name: 'Cantidad de votos',
          type: 'pie',
          radius: '70%', // Aumenta el tamaño del gráfico
          data: data2,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            show: true,
            fontSize: 32, // Tamaño de la fuente más grande para los datos
            color: '#333333', // Color más oscuro para los datos
            backgroundColor: 'transparent' // Fondo transparente para los datos
          },
          labelLine: {
            show: true,
            length: 10, // Ajusta la longitud de las líneas
            length2: 20,
            lineStyle: {
              color: '#333333', // Color más oscuro para las líneas
              width: 2 // Grosor de las líneas
            }
          }
        }
      ]
    };

    this.optionPie && this.myPieChart.setOption(this.optionPie);
    window.addEventListener('resize', this.myPieChart.resize);

    let data3 = await this.firestore.getVotosPrecio();

    this.chartLineDom = document.getElementById('line');
    this.myLineChart = echarts.init(this.chartLineDom);
    this.optionLine = {
      xAxis: {
        type: 'category',
        data: ['1', '2', '3', '4', '5'],
        name: "Puntaje elegido",
        nameLocation: "middle",
        nameTextStyle: {
          fontSize: 20,
          lineHeight: 40,
          color: '#333333' // Color más oscuro para el nombre del eje
        },
        axisLabel: {
          fontSize: 16, // Aumenta el tamaño de los números en el eje x
          color: '#333333' // Color más oscuro para los números en el eje x
        }
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        axisLabel: {
          fontSize: 16, // Aumenta el tamaño de los números en el eje y
          color: '#333333' // Color más oscuro para los números en el eje y
        }
      },
      series: [
        {
          data: data3,
          type: 'line',
          itemStyle: {
            color: '#B84141', // Puedes cambiar este valor al color que desees
          },
        }
      ]
    };

    this.optionLine && this.myLineChart.setOption(this.optionLine);
    window.addEventListener('resize', this.myLineChart.resize);

  }

  onClick() {
    this.router.navigateByUrl("/encuesta")
  }

}
