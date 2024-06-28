import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonLabel, IonRange, IonIcon, IonTextarea, IonButtons } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/service/auth.service';
import { Router } from '@angular/router';
import { ClienteService } from 'src/app/service/cliente.service';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-encuesta',
  templateUrl: './encuesta.page.html',
  styleUrls: ['./encuesta.page.scss'],
  standalone: true,
  imports: [IonButtons, IonIcon, IonLabel, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, FormsModule, ReactiveFormsModule, IonLabel, IonRange, IonTextarea]
})
export class EncuestaPage implements OnInit {

  public form : FormGroup;
  usuarioActual : any;
  isToastOpen = false;

  constructor(private formBuilder : FormBuilder, 
              private authService : AuthService, 
              private router : Router,
              private data : ClienteService,
              private navController : NavController) { 

    this.form = this.formBuilder.group({

      servicio: [1, [Validators.required]],
      comida: [1, [Validators.required]],
      resenia: ['', [Validators.required]],
      precio: [1, [Validators.required]],
    })
  }

  private Toast = Swal.mixin({
    toast: true,
    position: 'top',
    background: '#008b3c91',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });

  setOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }

  ngOnInit() {
    setTimeout(() => {
      this.checkUser();
    }, 2000);
  }
  

  async checkUser() {
    try {
      let currentUserEmail = await firstValueFrom(this.authService.actual());
      if (currentUserEmail) {
        let user = await this.authService.getUserActual(currentUserEmail);
        if (user) {
          this.usuarioActual = user;
          console.log('usuario es: ', this.usuarioActual);
        } else {
          console.log('usuario es 2: ', this.usuarioActual);
        }
      } else {
        console.log(this.authService.obtenerAnonimo());
        this.usuarioActual = await this.authService.getUserActual(this.authService.obtenerAnonimo());
      }
    } catch (error) {
      console.error('Error obteniendo nombre de usuario:', error);
    }
  }

  submitEncuesta()
  {   
    let encuesta = {

      usuario: this.usuarioActual.mail,
      servicio: this.form.controls["servicio"].value,
      precio: this.form.controls["precio"].value,
      comida: this.form.controls["comida"].value,
      resenia: this.form.controls["resenia"].value
    };

    this.data.saveEncuesta(encuesta);
    this.data.actualizarEstadoClienteEncuesta(this.usuarioActual.id, true);
    this.router.navigateByUrl("/graficos");
    console.log(this.form.controls["servicio"].value)
    console.log(this.form.controls["comida"].value)
    console.log(this.form.controls["precio"].value)
    console.log(this.form.controls["resenia"].value)
  }

  public async onBackClick()
  {
    this.navController.back();
  }

  

}
