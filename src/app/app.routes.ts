import { Routes } from '@angular/router';
import {HomeComponent} from './components/home/home.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'secretaria', component: SidenavComponent},
];
