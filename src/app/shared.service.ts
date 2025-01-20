// src/app/shared/shared.service.ts
import { Injectable } from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  // Crear un Subject para emitir eventos
  private controlSubject = new Subject<string>();
  private selectedTableSubject = new Subject<string>();
  private isSearchModeBS = new BehaviorSubject<boolean>(false);

  controlObservable$ = this.controlSubject.asObservable();
  selectedTable$ = this.selectedTableSubject.asObservable();
  public isSearchMode$ = this.isSearchModeBS.asObservable();
  constructor() { }

  // Método para emitir un evento
  emitControlAction(action: string) {
    this.controlSubject.next(action);
  }

  emitTableAction(tab : string){
    this.selectedTableSubject.next(tab)
  }

  deactivateSearchMode() {
    this.isSearchModeBS.next(false);
  }

}
