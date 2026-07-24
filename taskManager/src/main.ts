import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/interceptors/auth.interceptor';
import {LocationStrategy, HashLocationStrategy } from '@angular/common';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent,appConfig)
.catch(err => console.error(err));