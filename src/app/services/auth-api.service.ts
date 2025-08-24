import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { TokenResponse } from "@interfaces/login";

type Role = 'Secretaria' | 'Orientador' | 'Aluno';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
    private readonly apiBase = '/api';
    private readonly authBase = this.apiBase;
}