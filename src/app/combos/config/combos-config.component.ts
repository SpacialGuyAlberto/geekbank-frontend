import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ComboService } from '../../flash-sale/config/combo.service'; // Adjust import if needed, but I put it in flash-sale/config temporarily or moved it? Wait, I created it in existing path. Correcting import.
import { CurrencyPipe, NgForOf, NgIf } from '@angular/common';
import { SearchBarComponent } from '../../search-bar/search-bar.component'; // Reuse search bar if wanting to add products
import { KinguinGiftCard } from '../../kinguin-gift-cards/KinguinGiftCard';
import {Combo} from "../../flash-sale/config/models/Combo";

@Component({
    selector: 'app-combos-config',
    templateUrl: './combos-config.component.html',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        CurrencyPipe,
        NgForOf,
        NgIf,
    ],
    styleUrls: ['./combos-config.component.css']
})
export class CombosConfigComponent implements OnInit {
    comboForm!: FormGroup;
    combos: Combo[] = [];
    isEditMode = false;
    selectedComboId: number | null = null;

    // Para agregar productos al combo
    selectedProducts: number[] = [];

    // UI Tabs or states
    activeTab: 'list' | 'create' = 'list';

    constructor(
        private fb: FormBuilder,
        private comboService: ComboService
    ) { }

    ngOnInit() {
        this.initForm();
        this.loadCombos();
    }

    initForm() {
        this.comboForm = this.fb.group({
            name: ['', Validators.required],
            description: [''],
            price: ['', [Validators.required, Validators.min(0)]],
            imageUrl: [''],
            isActive: [true],
            // productIds se manejará aparte o en un FormArray si se complejidad
        });
        this.selectedProducts = [];
        this.isEditMode = false;
        this.selectedComboId = null;
    }

    loadCombos() {
        this.comboService.getAll().subscribe({
            next: (data) => this.combos = data,
            error: (err) => console.error('Error loading combos', err)
        });
    }

    saveCombo() {
        if (this.comboForm.invalid) return;

        const comboData: Combo = {
            ...this.comboForm.value,
            productIds: this.selectedProducts
        };

        if (this.isEditMode && this.selectedComboId) {
            this.comboService.update(this.selectedComboId, comboData).subscribe({
                next: () => {
                    this.loadCombos();
                    this.activeTab = 'list';
                    this.initForm();
                },
                error: (err) => console.error(err)
            });
        } else {
            this.comboService.create(comboData).subscribe({
                next: () => {
                    this.loadCombos();
                    this.activeTab = 'list';
                    this.initForm();
                },
                error: (err) => console.error(err)
            });
        }
    }

    editCombo(combo: Combo) {
        this.isEditMode = true;
        this.selectedComboId = combo.id!;
        this.activeTab = 'create';

        this.comboForm.patchValue({
            name: combo.name,
            description: combo.description,
            price: combo.price,
            imageUrl: combo.imageUrl,
            isActive: combo.isActive
        });

        this.selectedProducts = combo.productIds || [];
    }

    deleteCombo(id: number) {
        if (!confirm('¿Estás seguro de eliminar este combo?')) return;

        this.comboService.delete(id).subscribe({
            next: () => this.loadCombos(),
            error: (err) => console.error(err)
        });
    }

    // Métodos auxiliares para manejo de productos (simplificado por ahora)
    addProductId(idStr: string) {
        const id = parseInt(idStr);
        if (!isNaN(id) && !this.selectedProducts.includes(id)) {
            this.selectedProducts.push(id);
        }
    }

    removeProductId(index: number) {
        this.selectedProducts.splice(index, 1);
    }
}
