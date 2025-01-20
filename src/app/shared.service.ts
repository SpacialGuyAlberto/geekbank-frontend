// src/app/shared/shared.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  // Crear un Subject para emitir eventos
  private controlSubject = new Subject<string>();
  private selectedTableSubject = new Subject<string>();
  private isSearchMode = new Subject<boolean>()

  controlObservable$ = this.controlSubject.asObservable();
  selectedTable$ = this.selectedTableSubject.asObservable();
  isSearchMode$ = this.isSearchMode.asObservable();
  constructor() { }

  // Método para emitir un evento
  emitControlAction(action: string) {
    this.controlSubject.next(action);
  }

  emitTableAction(tab : string){
    this.selectedTableSubject.next(tab)
  }

  deactivateSearchMode(){
    this.isSearchMode.next(false);
  }

}
