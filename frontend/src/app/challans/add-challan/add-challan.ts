import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChallanService } from '../challan';

@Component({
  selector: 'app-add-challan',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './add-challan.html',
  styleUrls: ['./add-challan.css']
  
})
export class AddChallanComponent implements OnInit {
  isEdit = false;
  id: string | null = null;
  challan: any = {
    challanNo: '',
    date: new Date().toISOString().substring(0, 10),
    items: [{ description: '', quantity: 1 }],
    footer: { authorizedBy: '', receivedBy: '' }
  };

  constructor(private svc: ChallanService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.id;
    if (this.isEdit && this.id) {
      this.svc.get(this.id).subscribe((res: any) => {
        this.challan = {
          ...res,
          date: res.date ? new Date(res.date).toISOString().substring(0, 10) : this.challan.date
        };
      });
    }
  }

  addItem() {
    this.challan.items.push({ description: '', quantity: 1 });
  }

  removeItem(i: number) {
    if (this.challan.items.length === 1) return;
    this.challan.items.splice(i, 1);
  }

  save() {
    const payload = { ...this.challan, date: new Date(this.challan.date) };
    const obs = this.isEdit && this.id ? this.svc.update(this.id, payload) : this.svc.create(payload);
    obs.subscribe(() => this.router.navigate(['/challans']));
  }

  cancel() {
    this.router.navigate(['/challans']);
  }
}
