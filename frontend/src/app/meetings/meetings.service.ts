import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Meeting, Note, Summary } from './models';

@Injectable({ providedIn: 'root' })
export class MeetingsService {
  constructor(private http: HttpClient) {}

  listMeetings(page = 1): Observable<any> {
    return this.http.get(`/api/meetings/?page=${page}`);
  }

  getMeeting(id: number): Observable<Meeting> {
    return this.http.get<Meeting>(`/api/meetings/${id}/`);
  }

  addNote(meetingId: number, payload: { author: string; text: string }): Observable<Note> {
    return this.http.post<Note>(`/api/meetings/${meetingId}/notes/`, payload);
  }

  listNotes(meetingId: number, page = 1): Observable<any> {
    return this.http.get(`/api/meetings/${meetingId}/notes/?page=${page}`);
  }

  summarize(meetingId: number): Observable<any> {
    return this.http.post(`/api/meetings/${meetingId}/summarize/`, {});
  }

  getSummary(meetingId: number): Observable<Summary> {
    return this.http.get<Summary>(`/api/meetings/${meetingId}/summary/`);
  }

  createMeeting(payload: { title: string; started_at: string }): Observable<Meeting> {
    return this.http.post<Meeting>(`/api/meetings/`, payload);
  }
}
