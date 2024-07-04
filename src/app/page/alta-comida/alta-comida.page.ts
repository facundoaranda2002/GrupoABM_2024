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

  pathFoto1: string | null = null;
  pathFoto2: string | null = null;
  pathFoto3: string | null = null;

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
        Validators.minLength(10),
        Validators.minLength(50),
      ],
    ],
    precioProducto: [
      '',
      [Validators.required, Validators.pattern('^[0-9]{8}$')],
    ],
    tiempoEstimadoProducto: [
      '',
      [Validators.required, Validators.pattern('^[0-9]{8}$')],
    ],
    foto: ['', Validators.required],
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
    if (photo && photo.name) {
      this.form.patchValue({ foto: photo.name });
      this.Toast.fire({
        icon: 'success',
        title: 'Foto Subida',
        color: '#ffffff',
      });
    }
  }

  ngOnInit() {}

  async onSubmit(): Promise<void> {}
}
