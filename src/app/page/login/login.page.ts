import { Component, ElementRef, OnInit, inject } from '@angular/core';
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
  IonButtons,
  IonItem,
  IonInput,
  IonList,
  IonToast,
  IonFab,
  IonFabButton,
  IonIcon,
  IonFabList,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonFabList,
    IonIcon,
    IonFabButton,
    IonFab,
    IonToast,
    IonList,
    IonInput,
    IonItem,
    IonButtons,
    IonButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class LoginPage implements OnInit {
  router = inject(Router);
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  elementRef = inject(ElementRef);
  isToastOpen = false;
  usuario: any = null;

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

  constructor() {}

  form = this.fb.nonNullable.group({
    // email: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  ngOnInit() {}
  setOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }
  async onSubmit(): Promise<void> {
    const value = this.form.getRawValue();
    let pasa = 1;
    this.usuario = await this.authService.getUserActual(value.email);
    if (this.usuario !== null) {
      if (this.usuario.perfil === 'cliente') {
        if (this.usuario.estaValidado === 'pendiente') {
          pasa = 0;
        } else if (this.usuario.estaValidado === 'rechazado') {
          pasa = -1;
        }
      }
    }
    if (pasa === 1) {
      this.authService.login(value.email, value.password).subscribe({
        next: () => {
          setTimeout(() => {
            this.router.navigateByUrl('/home');
          }, 1000);
          this.form.reset();
        },
        error: () => {
          this.setOpen(true);
          this.form.setValue({ email: '', password: '' });
        },
      });
    } else if (pasa === 0) {
      this.Toast.fire({
        icon: 'warning',
        title:
          'Su cuenta esta pendiente de ser aceptada, este atento a su mail',
        color: '#ffffff',
      });
    } else if (pasa === -1) {
      this.Toast.fire({
        icon: 'error',
        title: 'Su cuenta a sido rechazada por un supervisor, lo lamentamos',
        color: '#ffffff',
      });
    }
  }
  goRegister() {
    this.router.navigateByUrl('/register');
  }
  goLogin() {
    this.router.navigateByUrl('/login');
  }
  goHome() {
    this.router.navigateByUrl('/home');
  }
  logout(): void {
    this.authService.logout();
  }
  userA() {
    this.form.setValue({ email: 'dueno@gmail.com', password: '123123' });
  }
  userB() {
    this.form.setValue({ email: 'supervisor@gmail.com', password: '123123' });
  }
  userC() {
    this.form.setValue({
      email: 'maitre@gmail.com',
      password: '123123',
    });
  }
  userD() {
    this.form.setValue({
      email: 'cocinero@gmail.com',
      password: '123123',
    });
  }
  userE() {
    this.form.setValue({
      email: 'mozo@gmail.com',
      password: '123123',
    });
  }
  userF() {
    this.form.setValue({
      email: 'bartender@gmail.com',
      password: '123123',
    });
  }
  userG() {
    this.form.setValue({ email: 'nepag22962@exeneli.com', password: '123123' });
  }
}
