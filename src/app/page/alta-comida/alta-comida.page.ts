import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonItem,
  IonFab,
  IonSelectOption,
  IonTextarea,
  IonInput,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { PhotoService } from 'src/app/service/photo.service';
import { MenuComida } from 'src/app/clases/menuComida';
import { Usuario } from 'src/app/clases/usuario';
import { AuthService } from 'src/app/service/auth.service';
import { MenuComidaService } from 'src/app/service/menu-comida.service';

@Component({
  selector: 'app-alta-comida',
  templateUrl: './alta-comida.page.html',
  styleUrls: ['./alta-comida.page.scss'],
  standalone: true,
  imports: [
    IonInput,
    IonTextarea,
    IonFab,
    IonItem,
    IonIcon,
    IonButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonSelectOption,
  ],
})
export class AltaComidaPage implements OnInit {
  router = inject(Router);
  fb = inject(FormBuilder);
  photoService = inject(PhotoService);
  authService = inject(AuthService);
  menuService = inject(MenuComidaService);

  pathFoto1: string | null = null;
  pathFoto2: string | null = null;
  pathFoto3: string | null = null;

  usuarioActual: Usuario | null = null;

  form = this.fb.nonNullable.group({
    nombreProducto: [
      '',
      [Validators.required, Validators.pattern('^[a-zA-Z ]*$')],
    ],
    descripcionProducto: [
      '',
      [
        Validators.required,
        Validators.pattern('^[a-zA-Z ]*$'),
        Validators.minLength(5),
        Validators.maxLength(50),
      ],
    ],
    precioProducto: ['', [Validators.required]],
    tiempoEstimadoProducto: ['', [Validators.required]],
  });

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

  async takePhoto() {
    const photo = await this.photoService.addClientPhoto();
    console.log(photo?.name);
    if (photo && photo.name) {
      const urlFoto = await this.photoService.getPhotoUrlClient(photo.name);
      console.log(urlFoto);
      if (urlFoto) {
        if (this.pathFoto1 == null) {
          this.pathFoto1 = urlFoto;
          this.Toast.fire({
            icon: 'success',
            title: 'Foto Uno Subida',
            color: '#ffffff',
          });
        } else if (this.pathFoto2 == null) {
          this.pathFoto2 = urlFoto;
          this.Toast.fire({
            icon: 'success',
            title: 'Foto Dos Subida',
            color: '#ffffff',
          });
        } else if (this.pathFoto3 == null) {
          this.pathFoto3 = urlFoto;
          this.Toast.fire({
            icon: 'success',
            title: 'Foto Tres Subida',
            color: '#ffffff',
          });
        } else {
          this.Toast.fire({
            icon: 'error',
            title: 'Ya estan todas las fotos subidas',
            color: '#ffffff',
          });
        }
      } else {
        this.Toast.fire({
          icon: 'error',
          title: 'No se Extraer la url de la foto',
          color: '#ffffff',
        });
      }
    } else {
      this.Toast.fire({
        icon: 'error',
        title: 'No se pudo guardar la foto',
        color: '#ffffff',
      });
    }
  }

  async checkDatosUsuarioActual() {
    if (this.authService.currentUserSig()) {
      this.usuarioActual = await this.authService.getUserActual(
        this.authService.currentUserSig()?.email
      );
    } else {
      console.log(this.authService.obtenerAnonimo());
      if (this.authService.obtenerAnonimo()) {
        this.usuarioActual = await this.authService.getUserActual(
          this.authService.obtenerAnonimo()
        );
        console.log(this.usuarioActual);
      }
    }
  }

  ngOnInit() {
    this.checkDatosUsuarioActual();
  }

  async onSubmit(): Promise<void> {
    if (
      this.form.valid &&
      this.pathFoto1 != null &&
      this.pathFoto2 != null &&
      this.pathFoto3 != null
    ) {
      console.log(this.usuarioActual);
      let perfil: string = '';
      if (this.usuarioActual?.perfil == 'cocinero') {
        perfil = 'comida';
      } else if (this.usuarioActual?.perfil == 'bartender') {
        perfil = 'bebida';
      }
      // Carga Menu
      let value = this.form.getRawValue();
      const auxMenu: MenuComida = {
        descripcion: value.descripcionProducto,
        img: this.pathFoto1,
        img2: this.pathFoto2,
        img3: this.pathFoto3,
        nombre: value.nombreProducto,
        precio: parseInt(value.precioProducto),
        sector: perfil,
        tiempoEstimado: parseInt(value.tiempoEstimadoProducto),
      };
      // Agrega Menu
      this.menuService
        .saveMenuComida(auxMenu)
        .then(() => {
          this.Toast.fire({
            icon: 'success',
            title: 'Plato Subido Correctamente',
            color: '#ffffff',
          });
          this.router.navigateByUrl('/home');
        })
        .catch(() => {
          this.Toast.fire({
            icon: 'error',
            title: 'No se pudo guardar la foto',
            color: '#ffffff',
          });
        });
    } else {
      this.Toast.fire({
        icon: 'error',
        title: 'Faltan Datos',
        color: '#ffffff',
      });
    }
  }
}
