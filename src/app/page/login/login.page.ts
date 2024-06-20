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

  constructor() { }

  form = this.fb.nonNullable.group({
    // email: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  ngOnInit() { }
  setOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }
  onSubmit(): void {
    const value = this.form.getRawValue();
    this.authService.login(value.email, value.password).subscribe({
      next: () => {
        setTimeout(() => {
          this.router.navigateByUrl('/home');
        }, 1000);
      },
      error: () => {
        this.setOpen(true);
        this.form.setValue({ email: '', password: '' });
      },
    });
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
  goMenu() {
    this.router.navigateByUrl('/menu');
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
