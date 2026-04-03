import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

const API = 'http://intelligent-rh:30222/api';

export interface TaskResponse {
  id: number;
  text: string;
  position: number;
  createdAt: string;
}

export interface ColumnResponse {
  id: number;
  name: string;
  position: number;
  color: string;
  tasks: TaskResponse[];
}

export interface BoardResponse {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  columns: ColumnResponse[];
}

interface CacheEntry {
  data: BoardResponse;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class KanbanService {

  // ✅ Cache interne — survit aux hot-reloads HMR car le service est singleton
  readonly boardCache = new Map<number, CacheEntry>();

  constructor(private http: HttpClient) {}

  // ---- BOARDS ----
  getBoards(): Observable<BoardResponse[]> {
    return this.http.get<BoardResponse[]>(`${API}/boards`);
  }

  getBoard(id: number): Observable<BoardResponse> {
    return this.http.get<BoardResponse>(`${API}/boards/${id}`).pipe(
      tap(data => this.setCache(id, data))
    );
  }

  createBoard(name: string): Observable<BoardResponse> {
    return this.http.post<BoardResponse>(`${API}/boards`, { name });
  }

  updateBoard(id: number, name: string): Observable<BoardResponse> {
    return this.http.put<BoardResponse>(`${API}/boards/${id}`, { name });
  }

  deleteBoard(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/boards/${id}`);
  }

  // ---- COLUMNS ----
  createColumn(boardId: number, name: string, position: number, color: string): Observable<ColumnResponse> {
    return this.http.post<ColumnResponse>(`${API}/boards/${boardId}/columns`, { name, position, color });
  }

  updateColumn(columnId: number, name: string, position: number, color: string): Observable<ColumnResponse> {
    return this.http.put<ColumnResponse>(`${API}/columns/${columnId}`, { name, position, color });
  }

  deleteColumn(columnId: number): Observable<void> {
    return this.http.delete<void>(`${API}/columns/${columnId}`);
  }

  // ---- TASKS ----
  createTask(columnId: number, text: string, position: number): Observable<TaskResponse> {
    return this.http.post<TaskResponse>(`${API}/columns/${columnId}/tasks`, { text, position });
  }

  updateTask(taskId: number, text: string, position: number): Observable<TaskResponse> {
    return this.http.put<TaskResponse>(`${API}/tasks/${taskId}`, { text, position });
  }

  moveTask(taskId: number, targetColumnId: number, newPosition: number): Observable<TaskResponse> {
    return this.http.put<TaskResponse>(`${API}/tasks/${taskId}/move`, { targetColumnId, newPosition });
  }

  deleteTask(taskId: number): Observable<void> {
    return this.http.delete<void>(`${API}/tasks/${taskId}`);
  }

  // ---- CACHE HELPERS ----
  setCache(boardId: number, data: BoardResponse): void {
    this.boardCache.set(boardId, { data, timestamp: Date.now() });
  }

  getCache(boardId: number): BoardResponse | null {
    const entry = this.boardCache.get(boardId);
    return entry?.data ?? null;
  }

  clearCache(boardId?: number): void {
    boardId !== undefined ? this.boardCache.delete(boardId) : this.boardCache.clear();
  }
}
