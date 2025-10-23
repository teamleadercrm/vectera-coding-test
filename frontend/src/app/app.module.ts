import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { MeetingsListComponent } from './meetings/meetings-list.component';
import { MeetingDetailComponent } from './meetings/meeting-detail.component';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  { path: '', redirectTo: 'meetings', pathMatch: 'full' },
  { path: 'meetings', component: MeetingsListComponent },
  { path: 'meetings/:id', component: MeetingDetailComponent },
];

@NgModule({
  declarations: [AppComponent, MeetingsListComponent, MeetingDetailComponent],
  imports: [BrowserModule, HttpClientModule, FormsModule, RouterModule.forRoot(routes)],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
