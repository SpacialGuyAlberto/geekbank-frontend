import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "../../environments/environment";
/**
 * Representa el modelo de ActivationDetails
 * que se gestionará en el backend.
 */
export interface ActivationDetails {
  id?: number;        // ID interno (opcional, autogenerado)
  kinguinId: number;  // Identificador del producto externo
  videoUrl?: string;  // URL de un video de activación
  textDetails?: string; // Instrucciones o texto detallado
}

@Injectable({
  providedIn: 'root',
})
export class ActivationDetailsService {
  /**
   * Ajusta la URL base a la de tu aplicación backend.
   * Ejemplo: 'http://localhost:8080/api/activation-details'
   */
  private baseUrl = environment.apiUrl;
  private apiUrl = `${this.baseUrl}/activation-details`;

  constructor(private http: HttpClient) {}

  /**
   * Crea o actualiza (upsert) los detalles de activación
   * de un producto identificado por kinguinId.
   *
   * Requiere que el usuario tenga el rol ADMIN o SUPPORT.
   */
  createOrUpdate(details: ActivationDetails): Observable<ActivationDetails> {
    // Cabeceras y configuración para enviar credenciales
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<ActivationDetails>(
      this.apiUrl,
      details,
      { headers, withCredentials: true } // withCredentials envía cookies o session tokens
    );
  }

  /**
   * Obtiene los detalles de activación asociados a un kinguinId específico.
   *
   * Requiere que el usuario tenga el rol ADMIN o SUPPORT.
   */
  getDetails(kinguinId: number): Observable<ActivationDetails> {
    return this.http.get<ActivationDetails>(
      `${this.apiUrl}/${kinguinId}`,
      { withCredentials: true }
    );
  }

  /**
   * Elimina los detalles de activación asociados a un kinguinId específico.
   *
   * Requiere que el usuario tenga el rol ADMIN o SUPPORT.
   */
  deleteDetails(kinguinId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${kinguinId}`,
      { withCredentials: true }
    );
  }
}
